import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';

import { SessionStore } from '../../core/auth/session-store';
import { EmployeeRepository } from '../../core/data/employee-repository';
import { VacationRepository } from '../../core/data/vacation-repository';
import { monthName, pad2, toDayNumber, today } from '../../domain/dates';
import { initials } from '../../domain/text';
import { greeting } from '../../domain/user';
import {
  VACATION_STATUS_LABELS,
  VacationEntry,
  VacationStatus,
  compareByStart,
  ongoingOn,
  startsInMonth,
  upcoming,
  vacationStatus,
} from '../../domain/vacation';
import { EmptyState } from '../../shared/ui/empty-state';
import { VacationEditor } from '../vacations/vacation-editor';

const LIST_LIMIT = 6;

const STATUS_TONE: Readonly<Record<VacationStatus, string>> = {
  scheduled: 'badge--info',
  ongoing: 'badge--success',
  finished: 'badge--neutral',
  invalid: 'badge--danger',
};

/** Cada card de indicador destaca o painel com a lista correspondente. */
type Highlight = 'today' | 'month' | 'next';

/** Página inicial: saudação, indicadores do dia e atalhos. */
@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, EmptyState],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly session = inject(SessionStore);
  private readonly employees = inject(EmployeeRepository);
  private readonly vacations = inject(VacationRepository);
  private readonly editor = inject(VacationEditor);

  protected readonly today = today();

  /** Card de indicador em destaque (mouse ou foco); ergue junto o painel correspondente. */
  protected readonly highlighted = signal<Highlight | null>(null);
  protected readonly monthLabel = monthName(this.today.getMonth() + 1).toLowerCase();

  protected readonly greeting = computed(() => {
    const user = this.session.user();
    return user ? greeting(user.name, user.gender) : 'Bem-vindo';
  });
  protected readonly loading = computed(
    () => this.vacations.status() === 'loading' || this.employees.status() === 'loading',
  );
  protected readonly failed = computed(
    () => this.vacations.status() === 'error' || this.employees.status() === 'error',
  );

  protected readonly employeeCount = computed(() => this.employees.employees().length);
  protected readonly onVacation = computed(() => ongoingOn(this.vacations.entries(), this.today));
  protected readonly startingThisMonth = computed(() =>
    this.vacations
      .entries()
      .filter((entry) => startsInMonth(entry, this.today.getMonth() + 1, this.today.getFullYear()))
      .sort(compareByStart),
  );
  protected readonly nextVacations = computed(() =>
    upcoming(this.vacations.entries(), this.today, 30),
  );

  protected readonly onVacationPreview = computed(() => this.onVacation().slice(0, LIST_LIMIT));
  protected readonly monthPreview = computed(() => this.startingThisMonth().slice(0, LIST_LIMIT));
  protected readonly nextPreview = computed(() => this.nextVacations().slice(0, LIST_LIMIT));

  protected initials(name: string): string {
    return initials(name);
  }

  /** Data curta para os painéis: omite o ano quando é o ano atual (ex.: 28/11). */
  protected shortDate(date: Date | null, fallback: string): string {
    if (!date) return fallback || '?';
    const dayMonth = `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
    return date.getFullYear() === this.today.getFullYear()
      ? dayMonth
      : `${dayMonth}/${date.getFullYear()}`;
  }

  protected statusLabel(entry: VacationEntry): string {
    return VACATION_STATUS_LABELS[vacationStatus(entry, this.today)];
  }

  protected statusTone(entry: VacationEntry): string {
    return STATUS_TONE[vacationStatus(entry, this.today)];
  }

  /** Liga/desliga o destaque somente se ele pertencer ao card que disparou o evento. */
  protected highlight(target: Highlight, active: boolean): void {
    if (active) this.highlighted.set(target);
    else if (this.highlighted() === target) this.highlighted.set(null);
  }

  protected daysUntil(entry: VacationEntry): number {
    return entry.start ? toDayNumber(entry.start) - toDayNumber(this.today) : 0;
  }

  protected daysLeft(entry: VacationEntry): number {
    return entry.end ? toDayNumber(entry.end) - toDayNumber(this.today) + 1 : 0;
  }

  protected addVacation(): void {
    void this.editor.create({ offerNavigation: true });
  }

  protected retry(): void {
    this.vacations.reload();
    this.employees.reload();
  }
}
