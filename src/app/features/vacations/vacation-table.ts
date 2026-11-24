import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { toDayNumber, today } from '../../domain/dates';
import { SortAccessors, SortState, sortRows } from '../../domain/sort';
import {
  VACATION_STATUS_LABELS,
  VacationEntry,
  VacationStatus,
  vacationStatus,
} from '../../domain/vacation';

const STATUS_TONE: Readonly<Record<VacationStatus, string>> = {
  scheduled: 'badge--info',
  ongoing: 'badge--success',
  finished: 'badge--neutral',
  invalid: 'badge--danger',
};

const STATUS_ORDER: Readonly<Record<VacationStatus, number>> = {
  ongoing: 0,
  scheduled: 1,
  finished: 2,
  invalid: 3,
};

const dayOf = (date: Date | null) => (date ? toDayNumber(date) : null);

const VACATION_COLUMNS = [
  'status',
  'purchasing',
  'start',
  'end',
  'limit',
  'days',
  'period',
  'intprop',
  'sell',
  'actions',
];

/** Tabela de férias com ordenação por coluna e ações de editar/excluir. */
@Component({
  selector: 'app-vacation-table',
  imports: [MatTableModule, MatSortModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './vacation-table.html',
  styleUrl: './vacation-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacationTable {
  readonly entries = input.required<readonly VacationEntry[]>();
  /** Exibe a coluna do funcionário (desnecessária na consulta por funcionário). */
  readonly showEmployee = input(true);
  readonly initialSort = input<SortState>({ active: 'start', direction: 'asc' });

  readonly edit = output<VacationEntry>();
  readonly remove = output<VacationEntry>();

  private readonly reference = today();
  private readonly accessors: SortAccessors<VacationEntry> = {
    status: (row) => STATUS_ORDER[vacationStatus(row, this.reference)],
    name: (row) => row.name,
    purchasing: (row) => row.purchasing,
    start: (row) => dayOf(row.start),
    end: (row) => dayOf(row.end),
    limit: (row) => dayOf(row.limitDate),
    days: (row) => row.totalDays,
    period: (row) => row.period,
    intprop: (row) => row.intprop,
    sell: (row) => row.sell,
  };

  protected readonly sort = linkedSignal(() => this.initialSort());
  protected readonly columns = computed(() =>
    this.showEmployee() ? ['status', 'name', ...VACATION_COLUMNS.slice(1)] : VACATION_COLUMNS,
  );
  protected readonly rows = computed(() => sortRows(this.entries(), this.sort(), this.accessors));

  protected statusLabel(row: VacationEntry): string {
    return VACATION_STATUS_LABELS[vacationStatus(row, this.reference)];
  }

  protected statusTone(row: VacationEntry): string {
    return STATUS_TONE[vacationStatus(row, this.reference)];
  }

  protected trackById(_index: number, row: VacationEntry): string {
    return row.id;
  }
}
