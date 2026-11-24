import { Params } from '@angular/router';

import { toMonth } from '../../domain/dates';
import { VacationStatus } from '../../domain/vacation';
import { VacationFilters } from '../../domain/vacation-filters';

/** Nome de cada filtro na URL (ex.: `/ferias/ano?ano=2026&cargo=Motorista&situacao=agendada`). */
const PARAM_NAMES = {
  search: 'busca',
  month: 'mes',
  status: 'situacao',
  office: 'cargo',
  purchasing: 'aquisitivo',
  period: 'periodo',
  intprop: 'intprop',
  sell: 'vendeu',
} as const satisfies Record<keyof VacationFilters, string>;

const STATUS_SLUGS: Readonly<Record<VacationStatus, string>> = {
  scheduled: 'agendada',
  ongoing: 'em-andamento',
  finished: 'concluida',
  invalid: 'datas-invalidas',
};

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function statusFromSlug(slug: string): VacationStatus | null {
  const match = (Object.keys(STATUS_SLUGS) as VacationStatus[]).find(
    (status) => STATUS_SLUGS[status] === slug,
  );
  return match ?? null;
}

/** Lê os filtros da URL, ignorando valores inválidos. */
export function filtersFromParams(params: Params): VacationFilters {
  return {
    search: text(params[PARAM_NAMES.search]),
    month: toMonth(params[PARAM_NAMES.month]),
    status: statusFromSlug(text(params[PARAM_NAMES.status])),
    office: text(params[PARAM_NAMES.office]),
    purchasing: text(params[PARAM_NAMES.purchasing]),
    period: text(params[PARAM_NAMES.period]),
    intprop: text(params[PARAM_NAMES.intprop]),
    sell: text(params[PARAM_NAMES.sell]),
  };
}

/** Converte uma alteração de filtros em parâmetros de URL (`null` remove o parâmetro). */
export function filtersToParams(change: Partial<VacationFilters>): Params {
  const params: Params = {};
  for (const key of Object.keys(change) as (keyof VacationFilters)[]) {
    const value = change[key];
    let param: string | number | null;
    if (key === 'status') param = value ? STATUS_SLUGS[value as VacationStatus] : null;
    else if (key === 'month') param = (value as number | null) ?? null;
    else param = (value as string).trim() || null;
    params[PARAM_NAMES[key]] = param;
  }
  return params;
}

/** Parâmetros que removem todos os filtros da URL. */
export function clearedFilterParams(): Params {
  return Object.fromEntries(Object.values(PARAM_NAMES).map((name) => [name, null]));
}
