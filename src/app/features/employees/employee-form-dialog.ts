import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map, startWith } from 'rxjs';

import { EmployeeRepository } from '../../core/data/employee-repository';
import { describeError } from '../../core/errors';
import { formatDate, parseDate, toDayNumber } from '../../domain/dates';
import { Employee, EmployeeData, vacationFieldsChanged } from '../../domain/employee';
import { collapseSpaces, distinctSorted, matchesSearch } from '../../domain/text';
import { guardDialogClose } from '../../shared/ui/dialog-guard';
import { NotificationService } from '../../shared/ui/notification-service';

export interface EmployeeFormData {
  /** Funcionário em edição. Sem este campo, o formulário é de inclusão. */
  readonly employee?: Employee;
}

interface EmployeeFormValue {
  readonly registration: string;
  readonly name: string;
  readonly office: string;
  readonly shift: string;
  readonly admission: Date | null;
  readonly admission2: Date | null;
}

export interface EmployeeFormResult {
  readonly created: boolean;
  /** Quantidade de férias atualizadas com os novos dados do funcionário. */
  readonly vacationsUpdated: number;
}

@Component({
  selector: 'app-employee-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './employee-form-dialog.html',
  styleUrl: './employee-form-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeFormDialog {
  private readonly data = inject<EmployeeFormData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<EmployeeFormDialog, EmployeeFormResult>>(MatDialogRef);
  private readonly repository = inject(EmployeeRepository);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly employee = this.data.employee;
  protected readonly editing = !!this.employee;
  protected readonly minDate = new Date(1950, 0, 1);
  protected readonly maxDate = new Date(2100, 11, 31);
  protected readonly saving = signal(false);

  private readonly uniqueRegistration: ValidatorFn = (control: AbstractControl) =>
    this.repository.isRegistrationTaken(String(control.value ?? ''), this.employee?.id)
      ? { registrationTaken: true }
      : null;

  private readonly afterAdmission: ValidatorFn = (control: AbstractControl) => {
    const admission = control.parent?.get('admission')?.value as Date | null | undefined;
    const second = control.value as Date | null;
    return admission && second && toDayNumber(second) < toDayNumber(admission)
      ? { beforeAdmission: true }
      : null;
  };

  protected readonly form = this.fb.group({
    registration: [
      this.employee?.registration ?? '',
      [Validators.required, Validators.maxLength(20), this.uniqueRegistration],
    ],
    name: [this.employee?.name ?? '', [Validators.required, Validators.maxLength(120)]],
    office: [this.employee?.office ?? '', [Validators.required, Validators.maxLength(80)]],
    shift: [this.employee?.shift ?? '', [Validators.required, Validators.maxLength(40)]],
    admission: this.fb.control<Date | null>(
      parseDate(this.employee?.admission),
      Validators.required,
    ),
    admission2: this.fb.control<Date | null>(parseDate(this.employee?.admission2), [
      this.afterAdmission,
    ]),
  });

  private readonly value = toSignal(
    this.form.valueChanges.pipe(
      startWith(null),
      map(() => this.form.getRawValue()),
    ),
    { requireSync: true },
  );

  private readonly offices = computed(() =>
    distinctSorted(this.repository.employees().map((employee) => employee.office)),
  );
  private readonly shifts = computed(() =>
    distinctSorted(this.repository.employees().map((employee) => employee.shift)),
  );
  protected readonly officeOptions = computed(() =>
    this.offices()
      .filter((office) => matchesSearch(this.value().office, office))
      .slice(0, 30),
  );
  protected readonly shiftOptions = computed(() =>
    this.shifts()
      .filter((shift) => matchesSearch(this.value().shift, shift))
      .slice(0, 30),
  );

  /** Aviso exibido quando a alteração também será aplicada às férias do funcionário. */
  protected readonly willUpdateVacations = computed(() => {
    if (!this.employee) return false;
    return vacationFieldsChanged(this.employee, this.toData(this.value()));
  });

  protected readonly requestClose = guardDialogClose(() => this.form.dirty);

  constructor() {
    // A 2ª admissão depende da 1ª: revalida quando a primeira muda.
    this.form.controls.admission.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.admission2.updateValueAndValidity({ emitEvent: false }));
  }

  protected dateError(control: 'admission' | 'admission2'): string {
    const field = this.form.controls[control];
    if (field.hasError('matDatepickerParse')) return 'Data inválida. Use o formato dd/mm/aaaa.';
    if (field.hasError('matDatepickerMin') || field.hasError('matDatepickerMax')) {
      return 'Data fora do intervalo permitido.';
    }
    if (field.hasError('required')) return 'Informe a data de admissão.';
    if (field.hasError('beforeAdmission')) return 'Deve ser posterior à primeira admissão.';
    return '';
  }

  protected clear(): void {
    this.form.reset({
      registration: '',
      name: '',
      office: '',
      shift: '',
      admission: null,
      admission2: null,
    });
  }

  protected async save(): Promise<void> {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.toData(this.form.getRawValue());
    this.saving.set(true);
    try {
      if (this.employee) {
        const vacationsUpdated = await this.repository.update(this.employee, data);
        this.ref.close({ created: false, vacationsUpdated });
      } else {
        await this.repository.create(data);
        this.ref.close({ created: true, vacationsUpdated: 0 });
      }
    } catch (error) {
      this.notifications.error(describeError(error, 'Não foi possível salvar o funcionário.'));
    } finally {
      this.saving.set(false);
    }
  }

  private toData(value: EmployeeFormValue): EmployeeData {
    return {
      registration: collapseSpaces(value.registration),
      name: collapseSpaces(value.name),
      office: collapseSpaces(value.office),
      shift: collapseSpaces(value.shift),
      admission: formatDate(value.admission),
      admission2: formatDate(value.admission2),
    };
  }
}
