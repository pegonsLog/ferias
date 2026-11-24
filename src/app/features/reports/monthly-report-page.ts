import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { VacationRepository } from '../../core/data/vacation-repository';
import { MONTH_OPTIONS, monthName, toMonth, toYear, today } from '../../domain/dates';
import { compareByStart, startsInMonth, sumDays, yearOptions } from '../../domain/vacation';
import { EmptyState } from '../../shared/ui/empty-state';
import { PageHeader } from '../../shared/ui/page-header';

/** Lista mensal de férias formatada para impressão (Ctrl+P ou botão "Imprimir"). */
@Component({
  selector: 'app-monthly-report-page',
  imports: [
    DatePipe,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeader,
    EmptyState,
  ],
  templateUrl: './monthly-report-page.html',
  styleUrl: './monthly-report-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:beforeprint)': 'issuedAt.set(now())' },
})
export class MonthlyReportPage {
  readonly mes = input<string>();
  readonly ano = input<string>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly vacationRepository = inject(VacationRepository);

  protected readonly months = MONTH_OPTIONS;
  protected readonly status = this.vacationRepository.status;
  protected readonly years = computed(() => yearOptions(this.vacationRepository.entries()));
  protected readonly month = computed(() => toMonth(this.mes()) ?? today().getMonth() + 1);
  protected readonly year = computed(() => toYear(this.ano()) ?? today().getFullYear());
  protected readonly title = computed(
    () => `Férias do mês de ${monthName(this.month())}/${this.year()}`,
  );
  protected readonly rows = computed(() =>
    this.vacationRepository
      .entries()
      .filter((entry) => startsInMonth(entry, this.month(), this.year()))
      .sort(compareByStart),
  );
  protected readonly totalDays = computed(() => sumDays(this.rows()));
  protected readonly issuedAt = signal(new Date());
  protected readonly now = () => new Date();

  protected setMonth(month: number): void {
    this.navigate({ mes: month, ano: this.year() });
  }

  protected setYear(year: number): void {
    this.navigate({ mes: this.month(), ano: year });
  }

  protected print(): void {
    this.issuedAt.set(new Date());
    window.print();
  }

  protected reload(): void {
    this.vacationRepository.reload();
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
