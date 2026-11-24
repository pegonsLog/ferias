import {
  addDays,
  formatDate,
  inclusiveDays,
  isWithin,
  normalizeDateText,
  parseDate,
  rangesOverlap,
  toDayNumber,
  today,
} from './dates';
import { Employee } from './employee';
import { collapseSpaces, compareText } from './text';

export const VACATION_PERIODS = ['1º Per', '2º Per', '3º Per', 'Único'] as const;

export const INT_PROP_OPTIONS = [
  { value: 'Int', label: 'Integral (Int)' },
  { value: 'Prop', label: 'Proporcional (Prop)' },
] as const;

export const SELL_OPTIONS = ['Sim', 'Não', 'N/A'] as const;

/**
 * Férias (coleção `vacations`).
 * Nome, cargo e admissão são copiados do funcionário para facilitar listagens e impressão.
 */
export interface Vacation {
  readonly id: string;
  readonly registration: string;
  readonly name: string;
  readonly office: string;
  readonly admission: string;
  /** Início no formato `dd/MM/yyyy`. */
  readonly startVacation: string;
  /** Término no formato `dd/MM/yyyy`. */
  readonly endVacation: string;
  readonly days: number;
  /** Data limite para gozo, `dd/MM/yyyy` ou vazio. */
  readonly limit: string;
  /** Período aquisitivo, ex.: `2023/2024`. */
  readonly purchasing: string;
  readonly period: string;
  readonly intprop: string;
  /** Vendeu 1/3 (abono pecuniário): `Sim`, `Não`, `N/A` ou vazio. */
  readonly sell: string;
  readonly observation: string;
}

/** Campos gravados no Firestore. */
export type VacationData = Omit<Vacation, 'id'>;

/** Férias com as datas já interpretadas, prontas para filtros e ordenação. */
export interface VacationEntry extends Vacation {
  readonly start: Date | null;
  readonly end: Date | null;
  readonly limitDate: Date | null;
  /** Dias calculados pelas datas; usa o valor gravado quando as datas são inválidas. */
  readonly totalDays: number;
}

export type VacationStatus = 'scheduled' | 'ongoing' | 'finished' | 'invalid';

export const VACATION_STATUS_LABELS: Readonly<Record<VacationStatus, string>> = {
  scheduled: 'Agendada',
  ongoing: 'Em andamento',
  finished: 'Concluída',
  invalid: 'Datas inválidas',
};

/** Dados digitados no formulário de férias. */
export interface VacationInput {
  readonly start: Date;
  readonly end: Date;
  readonly limit: Date | null;
  readonly purchasing: string;
  readonly period: string;
  readonly intprop: string;
  readonly sell: string;
  readonly observation: string;
}

function text(value: unknown): string {
  return value === null || value === undefined ? '' : String(value).trim();
}

/** Converte um documento do Firestore em `Vacation`, tolerando campos ausentes ou nulos. */
export function vacationFromRecord(id: string, raw: Readonly<Record<string, unknown>>): Vacation {
  const days = Number(raw['days']);
  return {
    id,
    registration: text(raw['registration']),
    name: text(raw['name']),
    office: text(raw['office']),
    admission: normalizeDateText(raw['admission']),
    startVacation: normalizeDateText(raw['startVacation']),
    endVacation: normalizeDateText(raw['endVacation']),
    days: Number.isFinite(days) ? days : 0,
    limit: normalizeDateText(raw['limit']),
    purchasing: text(raw['purchasing']),
    period: text(raw['period']),
    intprop: text(raw['intprop']),
    sell: text(raw['sell']),
    observation: text(raw['observation']),
  };
}

export function toEntry(vacation: Vacation): VacationEntry {
  const start = parseDate(vacation.startVacation);
  const end = parseDate(vacation.endVacation);
  const validRange = !!start && !!end && toDayNumber(end) >= toDayNumber(start);
  return {
    ...vacation,
    start,
    end,
    limitDate: parseDate(vacation.limit),
    totalDays: validRange ? inclusiveDays(start, end) : vacation.days,
  };
}

/** Monta o registro a ser gravado a partir do funcionário escolhido e do formulário. */
export function buildVacationData(
  employee: Pick<Employee, 'registration' | 'name' | 'office' | 'admission'>,
  input: VacationInput,
): VacationData {
  return {
    registration: employee.registration,
    name: employee.name,
    office: employee.office,
    admission: employee.admission,
    startVacation: formatDate(input.start),
    endVacation: formatDate(input.end),
    days: inclusiveDays(input.start, input.end),
    limit: formatDate(input.limit),
    purchasing: input.purchasing,
    period: input.period,
    intprop: input.intprop,
    sell: input.sell,
    observation: collapseSpacesKeepingLines(input.observation),
  };
}

function collapseSpacesKeepingLines(value: string): string {
  return value
    .split('\n')
    .map((line) => collapseSpaces(line))
    .join('\n')
    .trim();
}

export function vacationStatus(entry: VacationEntry, reference: Date = today()): VacationStatus {
  if (!entry.start || !entry.end) return 'invalid';
  const day = toDayNumber(reference);
  if (day < toDayNumber(entry.start)) return 'scheduled';
  if (day > toDayNumber(entry.end)) return 'finished';
  return 'ongoing';
}

export function sameRegistration(a: string, b: string): boolean {
  return a.trim() === b.trim();
}

export function startsInMonth(entry: VacationEntry, month: number, year: number): boolean {
  return (
    !!entry.start && entry.start.getFullYear() === year && entry.start.getMonth() + 1 === month
  );
}

export function startsInYear(entry: VacationEntry, year: number): boolean {
  return !!entry.start && entry.start.getFullYear() === year;
}

/** Ordem cronológica pelo início (datas inválidas no fim) e, no empate, pelo nome. */
export function compareByStart(a: VacationEntry, b: VacationEntry): number {
  const left = a.start ? toDayNumber(a.start) : Number.POSITIVE_INFINITY;
  const right = b.start ? toDayNumber(b.start) : Number.POSITIVE_INFINITY;
  if (left !== right) return left < right ? -1 : 1;
  return compareText(a.name, b.name);
}

/** Procura outras férias do mesmo funcionário que se sobreponham ao período informado. */
export function findOverlap(
  entries: readonly VacationEntry[],
  registration: string,
  start: Date,
  end: Date,
  ignoreId?: string,
): VacationEntry | undefined {
  return entries.find(
    (entry) =>
      entry.id !== ignoreId &&
      sameRegistration(entry.registration, registration) &&
      !!entry.start &&
      !!entry.end &&
      rangesOverlap(start, end, entry.start, entry.end),
  );
}

/** Férias em andamento na data informada. */
export function ongoingOn(entries: readonly VacationEntry[], date: Date): VacationEntry[] {
  return entries
    .filter((entry) => !!entry.start && !!entry.end && isWithin(date, entry.start, entry.end))
    .sort(compareByStart);
}

/** Férias que começam depois de `from` e até `days` dias à frente. */
export function upcoming(
  entries: readonly VacationEntry[],
  from: Date,
  days: number,
): VacationEntry[] {
  const first = toDayNumber(from) + 1;
  const last = toDayNumber(addDays(from, days));
  return entries
    .filter((entry) => {
      if (!entry.start) return false;
      const day = toDayNumber(entry.start);
      return day >= first && day <= last;
    })
    .sort(compareByStart);
}

export function sumDays(entries: readonly VacationEntry[]): number {
  return entries.reduce((total, entry) => total + (entry.totalDays > 0 ? entry.totalDays : 0), 0);
}

/**
 * Opções de período aquisitivo: alguns anos para trás e para frente do ano atual,
 * mais qualquer valor já gravado (para nunca perder uma opção existente).
 */
export function acquisitionPeriodOptions(
  existing: Iterable<string>,
  reference: Date = today(),
): string[] {
  const year = reference.getFullYear();
  const values = new Set<string>();
  for (let y = Math.min(2020, year - 6); y <= year + 3; y++) values.add(`${y}/${y + 1}`);
  for (const value of existing) {
    const trimmed = value.trim();
    if (trimmed) values.add(trimmed);
  }
  return [...values].sort(compareText);
}

/** Anos disponíveis nos filtros: faixa ao redor do ano atual mais os anos com férias gravadas. */
export function yearOptions(
  entries: readonly VacationEntry[],
  reference: Date = today(),
): number[] {
  const year = reference.getFullYear();
  const years = new Set<number>();
  for (let y = year - 5; y <= year + 2; y++) years.add(y);
  for (const entry of entries) if (entry.start) years.add(entry.start.getFullYear());
  return [...years].sort((a, b) => b - a);
}

/** Pessoa que pode ser consultada: funcionário cadastrado ou matrícula que só existe nas férias. */
export interface VacationPerson {
  readonly registration: string;
  readonly name: string;
  readonly office: string;
  readonly admission: string;
  /** `false` quando o funcionário foi excluído, mas ainda há férias com a matrícula dele. */
  readonly registered: boolean;
}

/** Junta funcionários e matrículas presentes apenas nas férias, para que nenhum histórico fique inacessível. */
export function vacationPeople(
  employees: readonly Employee[],
  entries: readonly VacationEntry[],
): VacationPerson[] {
  const people = new Map<string, VacationPerson>();
  for (const employee of employees) {
    if (!employee.registration || people.has(employee.registration)) continue;
    people.set(employee.registration, {
      registration: employee.registration,
      name: employee.name,
      office: employee.office,
      admission: employee.admission,
      registered: true,
    });
  }
  for (const entry of entries) {
    const registration = entry.registration.trim();
    if (!registration || people.has(registration)) continue;
    people.set(registration, {
      registration,
      name: entry.name,
      office: entry.office,
      admission: entry.admission,
      registered: false,
    });
  }
  return [...people.values()].sort((a, b) => compareText(a.name, b.name));
}

/** Texto curto do período de gozo: "01/08/2023 a 30/08/2023". */
export function describeRange(entry: Pick<Vacation, 'startVacation' | 'endVacation'>): string {
  return `${entry.startVacation || '?'} a ${entry.endVacation || '?'}`;
}
