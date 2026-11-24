import { TextFieldModule } from '@angular/cdk/text-field';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCalendarCellClassFunction, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { map, startWith } from 'rxjs';

import { EmployeeRepository } from '../../core/data/employee-repository';
import { VacationRepository } from '../../core/data/vacation-repository';
import { describeError } from '../../core/errors';
import { formatDayCount, inclusiveDays, toDayNumber } from '../../domain/dates';
import { Employee, employeeLabel, filterByNameOrRegistration } from '../../domain/employee';
import {
  INT_PROP_OPTIONS,
  SELL_OPTIONS,
  VACATION_PERIODS,
  VacationEntry,
  acquisitionPeriodOptions,
  buildVacationData,
  findOverlap,
  sameRegistration,
} from '../../domain/vacation';
import { guardDialogClose } from '../../shared/ui/dialog-guard';
import { NotificationService } from '../../shared/ui/notification-service';

export interface VacationFormData {
  /** Férias em edição. Sem este campo, o formulário é de inclusão. */
  readonly vacation?: VacationEntry;
  /** Matrícula a pré-selecionar na inclusão. */
  readonly registration?: string;
}

export interface VacationFormResult {
  readonly registration: string;
}

type EmployeeValue = Employee | string | null;

/** O campo de funcionário precisa conter um item escolhido da lista, não só texto digitado. */
const employeeSelected: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() ? { employeeNotSelected: true } : null;

/** Funcionário "virtual" para férias cujo cadastro foi excluído. */
function employeeFromVacation(vacation: VacationEntry): Employee {
  return {
    id: '',
    registration: vacation.registration,
    name: vacation.name,
    office: vacation.office,
    admission: vacation.admission,
    shift: '',
    admission2: '',
  };
}

@Component({
  selector: 'app-vacation-form-dialog',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TextFieldModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './vacation-form-dialog.html',
  styleUrl: './vacation-form-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacationFormDialog {
  private readonly data = inject<VacationFormData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<VacationFormDialog, VacationFormResult>>(MatDialogRef);
  private readonly employeeRepository = inject(EmployeeRepository);
  private readonly vacationRepository = inject(VacationRepository);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly vacation = this.data.vacation;
  protected readonly editing = !!this.vacation;
  protected readonly employees = this.employeeRepository.employees;
  protected readonly employeesStatus = this.employeeRepository.status;
  protected readonly minDate = new Date(1950, 0, 1);
  protected readonly maxDate = new Date(2100, 11, 31);
  protected readonly periods = VACATION_PERIODS;
  protected readonly intPropOptions = INT_PROP_OPTIONS;
  protected readonly sellOptions = SELL_OPTIONS;
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group(
    {
      employee: this.fb.control<EmployeeValue>(this.initialEmployee(), [
        Validators.required,
        employeeSelected,
      ]),
      start: this.fb.control<Date | null>(this.vacation?.start ?? null, Validators.required),
      end: this.fb.control<Date | null>(this.vacation?.end ?? null, Validators.required),
      limit: this.fb.control<Date | null>(this.vacation?.limitDate ?? null),
      purchasing: [this.vacation?.purchasing ?? '', Validators.required],
      period: [this.vacation?.period ?? '', Validators.required],
      intprop: [this.vacation?.intprop ?? '', Validators.required],
      sell: [this.vacation?.sell ?? ''],
      observation: [this.vacation?.observation ?? '', Validators.maxLength(1000)],
    },
    { validators: (group) => this.overlapValidator(group) },
  );

  private readonly value = toSignal(
    this.form.valueChanges.pipe(
      startWith(null),
      map(() => this.form.getRawValue()),
    ),
    { requireSync: true },
  );

  protected readonly selectedEmployee = computed(() => {
    const employee = this.value().employee;
    return employee && typeof employee === 'object' ? employee : null;
  });

  protected readonly employeeOptions = computed(() => {
    const value = this.value().employee;
    return filterByNameOrRegistration(this.employees(), typeof value === 'string' ? value : '');
  });

  protected readonly days = computed(() => {
    const { start, end } = this.value();
    return start && end && toDayNumber(end) >= toDayNumber(start) ? inclusiveDays(start, end) : 0;
  });

  protected readonly purchasingOptions = computed(() =>
    acquisitionPeriodOptions([
      ...this.vacationRepository.entries().map((entry) => entry.purchasing),
      this.vacation?.purchasing ?? '',
    ]),
  );

  /** Outras férias do funcionário escolhido, destacadas no calendário. */
  private readonly takenRanges = computed(() => {
    const employee = this.selectedEmployee();
    if (!employee) return [];
    return this.vacationRepository
      .entries()
      .filter(
        (entry) =>
          entry.id !== this.vacation?.id &&
          sameRegistration(entry.registration, employee.registration) &&
          !!entry.start &&
          !!entry.end,
      )
      .map((entry) => [toDayNumber(entry.start!), toDayNumber(entry.end!)] as const);
  });

  protected readonly dateClass: MatCalendarCellClassFunction<Date> = (date, view) => {
    if (view !== 'month') return '';
    const day = toDayNumber(date);
    return this.takenRanges().some(([start, end]) => day >= start && day <= end)
      ? 'calendar-taken-day'
      : '';
  };

  protected readonly formatDayCount = formatDayCount;
  protected readonly requestClose = guardDialogClose(() => this.form.dirty);

  constructor() {
    // Quando a lista de funcionários chega depois da abertura, troca o funcionário "virtual"
    // pelo cadastro real (sem marcar o formulário como alterado).
    effect(() => {
      const employees = this.employees();
      untracked(() => {
        const control = this.form.controls.employee;
        const current = control.value;
        // Não interfere depois que o usuário mexeu no campo.
        if (control.dirty || (typeof current === 'string' && current)) return;
        const wanted =
          current && typeof current === 'object' ? current.registration : this.data.registration;
        if (!wanted || (current && typeof current === 'object' && current.id)) return;
        const match = employees.find((employee) => employee.registration === wanted.trim());
        if (match) control.setValue(match);
      });
    });
  }

  protected displayEmployee(value: EmployeeValue): string {
    if (!value) return '';
    return typeof value === 'string' ? value : employeeLabel(value);
  }

  protected employeeError(): string {
    const control = this.form.controls.employee;
    if (control.hasError('required')) return 'Selecione o funcionário.';
    if (control.hasError('employeeNotSelected')) return 'Escolha um funcionário da lista.';
    return '';
  }

  protected rangeError(): string {
    const { start, end } = this.form.controls;
    const has = (code: string) => start.hasError(code) || end.hasError(code);
    if (has('matDatepickerParse')) return 'Data inválida. Use o formato dd/mm/aaaa.';
    if (has('matDatepickerMin') || has('matDatepickerMax'))
      return 'Data fora do intervalo permitido.';
    if (has('required')) return 'Informe o início e o término.';
    if (start.hasError('matStartDateInvalid') || end.hasError('matEndDateInvalid')) {
      return 'O término deve ser igual ou posterior ao início.';
    }
    return '';
  }

  /**
   * O Material só revalida a outra ponta do período quando a data é escolhida no calendário.
   * Ao digitar, revalidamos manualmente para não deixar um erro "preso" no outro campo.
   */
  protected revalidate(control: 'start' | 'end'): void {
    this.form.controls[control].updateValueAndValidity();
  }

  protected overlapConflict(): VacationEntry | null {
    return (this.form.errors?.['overlap'] as VacationEntry | undefined) ?? null;
  }

  protected clear(): void {
    this.form.reset({
      employee: null,
      start: null,
      end: null,
      limit: null,
      purchasing: '',
      period: '',
      intprop: '',
      sell: '',
      observation: '',
    });
  }

  protected async save(): Promise<void> {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const chosen = raw.employee as Employee;
    const employee = this.employeeRepository.findByRegistration(chosen.registration) ?? chosen;
    const data = buildVacationData(employee, {
      start: raw.start!,
      end: raw.end!,
      limit: raw.limit,
      purchasing: raw.purchasing,
      period: raw.period,
      intprop: raw.intprop,
      sell: raw.sell,
      observation: raw.observation,
    });

    this.saving.set(true);
    try {
      if (this.vacation) {
        await this.vacationRepository.update(this.vacation.id, data);
      } else {
        await this.vacationRepository.create(data);
      }
      this.ref.close({ registration: data.registration });
    } catch (error) {
      this.notifications.error(describeError(error, 'Não foi possível salvar as férias.'));
    } finally {
      this.saving.set(false);
    }
  }

  private initialEmployee(): EmployeeValue {
    if (this.vacation) {
      return (
        this.employeeRepository.findByRegistration(this.vacation.registration) ??
        employeeFromVacation(this.vacation)
      );
    }
    return this.data.registration
      ? (this.employeeRepository.findByRegistration(this.data.registration) ?? null)
      : null;
  }

  private overlapValidator(group: AbstractControl): ValidationErrors | null {
    const { employee, start, end } = group.value as {
      employee?: EmployeeValue;
      start?: Date | null;
      end?: Date | null;
    };
    if (!employee || typeof employee !== 'object' || !start || !end) return null;
    if (toDayNumber(end) < toDayNumber(start)) return null;
    const conflict = findOverlap(
      this.vacationRepository.entries(),
      employee.registration,
      start,
      end,
      this.vacation?.id,
    );
    return conflict ? { overlap: conflict } : null;
  }
}
