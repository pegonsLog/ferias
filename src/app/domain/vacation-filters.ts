import { MONTH_OPTIONS, today } from './dates';
import { compareText, matchesSearch, normalizeText } from './text';
import {
  INT_PROP_OPTIONS,
  VACATION_STATUS_LABELS,
  VacationEntry,
  VacationStatus,
  vacationStatus,
} from './vacation';

/** Valor de filtro que representa "campo não preenchido". */
export const NOT_INFORMED = '-';

/** Filtros aplicados sobre uma lista de férias. Texto vazio ou `null` significa "todos". */
export interface VacationFilters {
  /** Busca livre em nome, matrícula, cargo e observações. */
  readonly search: string;
  /** Mês de início (1 a 12). */
  readonly month: number | null;
  readonly status: VacationStatus | null;
  readonly office: string;
  readonly purchasing: string;
  readonly period: string;
  readonly intprop: string;
  readonly sell: string;
}

export const EMPTY_FILTERS: VacationFilters = {
  search: '',
  month: null,
  status: null,
  office: '',
  purchasing: '',
  period: '',
  intprop: '',
  sell: '',
};

export interface FilterOption<T = string> {
  readonly value: T;
  readonly label: string;
  /** Quantidade de férias com este valor (no conjunto sem filtros). */
  readonly count: number;
}

export interface VacationFilterOptions {
  readonly months: readonly FilterOption<number>[];
  readonly statuses: readonly FilterOption<VacationStatus>[];
  readonly offices: readonly FilterOption[];
  readonly purchasing: readonly FilterOption[];
  readonly periods: readonly FilterOption[];
  readonly intprop: readonly FilterOption[];
  readonly sell: readonly FilterOption[];
}

type TextFilterKey = 'office' | 'purchasing' | 'period' | 'intprop' | 'sell';

const TEXT_FIELDS: Readonly<Record<TextFilterKey, (entry: VacationEntry) => string>> = {
  office: (entry) => entry.office,
  purchasing: (entry) => entry.purchasing,
  period: (entry) => entry.period,
  intprop: (entry) => entry.intprop,
  sell: (entry) => entry.sell,
};

const STATUS_ORDER: readonly VacationStatus[] = ['scheduled', 'ongoing', 'finished', 'invalid'];

const INT_PROP_LABELS = new Map<string, string>(
  INT_PROP_OPTIONS.map((option) => [normalizeText(option.value), option.label]),
);

/** Quantos filtros estão ativos. */
export function activeFilterCount(filters: VacationFilters): number {
  return (
    (filters.search.trim() ? 1 : 0) +
    (filters.month !== null ? 1 : 0) +
    (filters.status !== null ? 1 : 0) +
    (Object.keys(TEXT_FIELDS) as TextFilterKey[]).filter((key) => filters[key] !== '').length
  );
}

function matchesValue(value: string, selected: string): boolean {
  if (!selected) return true;
  if (selected === NOT_INFORMED) return !value.trim();
  return normalizeText(value) === normalizeText(selected);
}

/** Aplica todos os filtros (combinados com "E"). */
export function filterVacations(
  entries: readonly VacationEntry[],
  filters: VacationFilters,
  reference: Date = today(),
): VacationEntry[] {
  const textKeys = (Object.keys(TEXT_FIELDS) as TextFilterKey[]).filter((key) => filters[key]);
  return entries.filter(
    (entry) =>
      (filters.month === null || (!!entry.start && entry.start.getMonth() + 1 === filters.month)) &&
      (filters.status === null || vacationStatus(entry, reference) === filters.status) &&
      textKeys.every((key) => matchesValue(TEXT_FIELDS[key](entry), filters[key])) &&
      matchesSearch(
        filters.search,
        entry.name,
        entry.registration,
        entry.office,
        entry.observation,
      ),
  );
}

/**
 * Opções de um campo de texto: valores distintos presentes nos dados (sem diferenciar
 * maiúsculas/acentos), "Não informado" quando houver registros vazios e o valor selecionado,
 * mesmo que não exista mais nos dados (para o filtro ativo continuar visível).
 */
function textOptions(
  entries: readonly VacationEntry[],
  pick: (entry: VacationEntry) => string,
  selected: string,
  label: (value: string) => string = (value) => value,
): FilterOption[] {
  const groups = new Map<string, { value: string; count: number }>();
  for (const entry of entries) {
    const raw = pick(entry).trim();
    const key = raw ? normalizeText(raw) : NOT_INFORMED;
    const group = groups.get(key);
    if (group) group.count++;
    else groups.set(key, { value: raw || NOT_INFORMED, count: 1 });
  }
  if (selected) {
    const key = selected === NOT_INFORMED ? NOT_INFORMED : normalizeText(selected);
    if (!groups.has(key)) groups.set(key, { value: selected, count: 0 });
  }

  const options = [...groups.values()]
    .filter((group) => group.value !== NOT_INFORMED)
    .map((group) => ({ value: group.value, label: label(group.value), count: group.count }))
    .sort((a, b) => compareText(a.label, b.label));
  const empty = groups.get(NOT_INFORMED);
  if (empty) options.push({ value: NOT_INFORMED, label: 'Não informado', count: empty.count });
  return options;
}

/** Monta as opções de todos os filtros a partir das férias sem filtro (ex.: as do ano). */
export function buildFilterOptions(
  entries: readonly VacationEntry[],
  filters: VacationFilters,
  reference: Date = today(),
): VacationFilterOptions {
  const monthCounts = new Array<number>(13).fill(0);
  const statusCounts = new Map<VacationStatus, number>();
  for (const entry of entries) {
    if (entry.start) monthCounts[entry.start.getMonth() + 1]++;
    const status = vacationStatus(entry, reference);
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  return {
    months: MONTH_OPTIONS.map((month) => ({
      value: month.value,
      label: month.label,
      count: monthCounts[month.value],
    })),
    statuses: STATUS_ORDER.filter(
      (status) => status !== 'invalid' || statusCounts.has(status) || filters.status === status,
    ).map((status) => ({
      value: status,
      label: VACATION_STATUS_LABELS[status],
      count: statusCounts.get(status) ?? 0,
    })),
    offices: textOptions(entries, TEXT_FIELDS.office, filters.office),
    purchasing: textOptions(entries, TEXT_FIELDS.purchasing, filters.purchasing),
    periods: textOptions(entries, TEXT_FIELDS.period, filters.period),
    intprop: textOptions(
      entries,
      TEXT_FIELDS.intprop,
      filters.intprop,
      (value) => INT_PROP_LABELS.get(normalizeText(value)) ?? value,
    ),
    sell: textOptions(entries, TEXT_FIELDS.sell, filters.sell),
  };
}
