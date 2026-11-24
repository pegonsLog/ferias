import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  FilterOption,
  VacationFilterOptions,
  VacationFilters,
  activeFilterCount,
} from '../../domain/vacation-filters';

const SEARCH_DEBOUNCE_MS = 250;

/** Painel de filtros das férias. Só exibe e emite alterações; quem aplica é a página. */
@Component({
  selector: 'app-vacation-filters-bar',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './vacation-filters-bar.html',
  styleUrl: './vacation-filters-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacationFiltersBar {
  readonly filters = input.required<VacationFilters>();
  readonly options = input.required<VacationFilterOptions>();

  /** Alteração de um ou mais filtros. */
  readonly changed = output<Partial<VacationFilters>>();
  /** Pedido para remover todos os filtros. */
  readonly cleared = output<void>();

  protected readonly activeCount = computed(() => activeFilterCount(this.filters()));

  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  private lastEmittedSearch = '';

  /**
   * Texto do campo de busca. Segue a URL, exceto quando a mudança na URL é só o "eco" do que o
   * próprio usuário digitou. Isso evita apagar letras digitadas enquanto a navegação acontece.
   */
  protected readonly searchText = linkedSignal<string, string>({
    source: () => this.filters().search,
    computation: (search, previous) =>
      previous && search === this.lastEmittedSearch ? previous.value : search,
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.searchTimer));
  }

  /** Texto exibido no campo fechado: só o rótulo, sem a contagem mostrada na lista. */
  protected labelOf<T>(
    options: readonly FilterOption<T>[],
    value: T | null | '',
    allLabel: string,
  ): string {
    if (value === null || value === '') return allLabel;
    return options.find((option) => option.value === value)?.label ?? String(value);
  }

  protected onSearchInput(value: string): void {
    this.searchText.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.emitSearch(value), SEARCH_DEBOUNCE_MS);
  }

  protected clearSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchText.set('');
    this.emitSearch('');
  }

  protected setMonth(value: number | ''): void {
    this.changed.emit({ month: value === '' ? null : value });
  }

  protected setStatus(value: VacationFilters['status'] | ''): void {
    this.changed.emit({ status: value === '' ? null : value });
  }

  protected setText(
    key: 'office' | 'purchasing' | 'period' | 'intprop' | 'sell',
    value: string,
  ): void {
    this.changed.emit({ [key]: value });
  }

  protected clearAll(): void {
    clearTimeout(this.searchTimer);
    this.lastEmittedSearch = '';
    this.searchText.set('');
    this.cleared.emit();
  }

  private emitSearch(value: string): void {
    const search = value.trim();
    this.lastEmittedSearch = search;
    if (search !== this.filters().search) this.changed.emit({ search });
  }
}
