import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { EmployeeRepository } from '../../core/data/employee-repository';
import { VacationRepository } from '../../core/data/vacation-repository';
import {
  MONTH_OPTIONS,
  formatDayCount,
  monthName,
  toMonth,
  toYear,
  today,
} from '../../domain/dates';
import { employeeLabel, filterByNameOrRegistration } from '../../domain/employee';
import { SortState } from '../../domain/sort';
import { initials } from '../../domain/text';
import {
  VacationEntry,
  VacationPerson,
  sameRegistration,
  startsInMonth,
  startsInYear,
  sumDays,
  vacationPeople,
  yearOptions,
} from '../../domain/vacation';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';
import { VacationEditor } from './vacation-editor';
import { VacationTable } from './vacation-table';

export type VacationSearchMode = 'employee' | 'month' | 'year';

const HEADINGS: Readonly<Record<VacationSearchMode, string>> = {
  employee: 'Férias do funcionário',
  month: 'Férias do mês',
  year: 'Férias do ano',
};

/**
 * Consultas de férias por funcionário, mês ou ano.
 * Os filtros ficam na URL (`?matricula=`, `?mes=&ano=`), permitindo voltar, favoritar e compartilhar.
 */
@Component({
  selector: 'app-vacation-search-page',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeader,
    EmptyState,
    VacationTable,
  ],
  templateUrl: './vacation-search-page.html',
  styleUrl: './vacation-search-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacationSearchPage {
  /** Definido na rota (`data.mode`). */
  readonly mode = input.required<VacationSearchMode>();
  /** Parâmetros da URL. */
  readonly matricula = input<string>();
  readonly mes = input<string>();
  readonly ano = input<string>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly vacationRepository = inject(VacationRepository);
  private readonly employeeRepository = inject(EmployeeRepository);
  private readonly editor = inject(VacationEditor);
  private readonly autocomplete = viewChild(MatAutocompleteTrigger);

  protected readonly months = MONTH_OPTIONS;
  protected readonly status = this.vacationRepository.status;
  protected readonly years = computed(() => yearOptions(this.vacationRepository.entries()));
  protected readonly month = computed(() => toMonth(this.mes()) ?? today().getMonth() + 1);
  protected readonly year = computed(() => toYear(this.ano()) ?? today().getFullYear());
  protected readonly registration = computed(() => (this.matricula() ?? '').trim());

  protected readonly heading = computed(() => HEADINGS[this.mode()]);
  protected readonly description = computed(() => {
    switch (this.mode()) {
      case 'employee':
        return 'Histórico completo de férias de um funcionário.';
      case 'month':
        return `Férias com início em ${monthName(this.month()).toLowerCase()} de ${this.year()}.`;
      case 'year':
        return `Férias com início em ${this.year()}.`;
    }
  });

  // Seleção de funcionário (consulta por funcionário).
  protected readonly personControl = new FormControl<VacationPerson | string>('', {
    nonNullable: true,
  });
  private readonly personTerm = toSignal(this.personControl.valueChanges, { initialValue: '' });
  private readonly people = computed(() =>
    vacationPeople(this.employeeRepository.employees(), this.vacationRepository.entries()),
  );
  protected readonly personOptions = computed(() => {
    const term = this.personTerm();
    return filterByNameOrRegistration(this.people(), typeof term === 'string' ? term : '');
  });
  protected readonly selectedPerson = computed<VacationPerson | null>(() => {
    const registration = this.registration();
    if (!registration) return null;
    return (
      this.people().find((person) => person.registration === registration) ?? {
        registration,
        name: '',
        office: '',
        admission: '',
        registered: false,
      }
    );
  });
  protected readonly personInitials = computed(() => initials(this.selectedPerson()?.name ?? ''));

  protected readonly results = computed<VacationEntry[]>(() => {
    const entries = this.vacationRepository.entries();
    switch (this.mode()) {
      case 'employee': {
        const registration = this.registration();
        return registration
          ? entries.filter((entry) => sameRegistration(entry.registration, registration))
          : [];
      }
      case 'month':
        return entries.filter((entry) => startsInMonth(entry, this.month(), this.year()));
      case 'year':
        return entries.filter((entry) => startsInYear(entry, this.year()));
    }
  });
  protected readonly totalDays = computed(() => sumDays(this.results()));
  protected readonly hasQuery = computed(() => this.mode() !== 'employee' || !!this.registration());
  protected readonly initialSort = computed<SortState>(() =>
    this.mode() === 'employee'
      ? { active: 'start', direction: 'desc' }
      : { active: 'start', direction: 'asc' },
  );
  protected readonly formatDayCount = formatDayCount;

  /** Matrícula exibida por último no campo de busca. */
  private syncedRegistration: string | null = null;

  constructor() {
    // Mantém o campo de busca coerente com a matrícula da URL (inclusive ao voltar/avançar).
    effect(() => {
      const person = this.selectedPerson();
      untracked(() => this.syncPersonControl(person));
    });
  }

  protected displayPerson(value: VacationPerson | string | null): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.name ? employeeLabel(value) : `Mat. ${value.registration}`;
  }

  protected selectPerson(person: VacationPerson): void {
    this.navigate({ matricula: person.registration });
  }

  /** Enter sem escolher sugestão: usa o texto digitado como matrícula. */
  protected searchTyped(event: Event): void {
    if (event.defaultPrevented || this.autocomplete()?.activeOption) return;
    const value = this.personControl.value;
    if (typeof value !== 'string' || !value.trim()) return;
    const term = value.trim();
    const match =
      this.people().find((person) => person.registration === term) ??
      (this.personOptions().length === 1 ? this.personOptions()[0] : undefined);
    this.navigate({ matricula: match?.registration ?? term });
    this.autocomplete()?.closePanel();
  }

  protected clearPerson(): void {
    this.personControl.setValue('');
    this.navigate({ matricula: null });
  }

  protected setMonth(month: number): void {
    this.navigate({ mes: month, ano: this.year() });
  }

  protected setYear(year: number): void {
    this.navigate(this.mode() === 'month' ? { mes: this.month(), ano: year } : { ano: year });
  }

  protected add(): void {
    const registration = this.mode() === 'employee' ? this.registration() : '';
    void this.editor.create({ registration: registration || undefined });
  }

  protected edit(entry: VacationEntry): void {
    void this.editor.edit(entry);
  }

  protected remove(entry: VacationEntry): void {
    void this.editor.remove(entry);
  }

  protected reload(): void {
    this.vacationRepository.reload();
  }

  private syncPersonControl(person: VacationPerson | null): void {
    const current = this.personControl.value;
    if (!person) {
      this.syncedRegistration = null;
      if (typeof current !== 'string') this.personControl.setValue('');
      return;
    }
    // O usuário está digitando outra busca e a URL não mudou: preserva o texto digitado
    // (atualizações em tempo real do banco não devem apagar a digitação).
    if (
      typeof current === 'string' &&
      current.trim() &&
      this.syncedRegistration === person.registration
    ) {
      return;
    }
    this.syncedRegistration = person.registration;
    if (
      typeof current === 'string' ||
      current.registration !== person.registration ||
      current.name !== person.name
    ) {
      this.personControl.setValue(person);
    }
  }

  private navigate(queryParams: Params): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
