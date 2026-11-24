/**
 * Utilitários de data.
 *
 * As datas são gravadas no Firestore como texto no formato `dd/MM/yyyy`, para manter
 * compatibilidade com os registros já existentes. Toda conta (dias, sobreposição, filtros)
 * é feita sobre "número do dia" em UTC, o que elimina erros de horário de verão.
 */

const BR_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/;
const ISO_DATE = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|T)/;
const MS_PER_DAY = 86_400_000;

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

export interface MonthOption {
  /** Mês de 1 a 12. */
  readonly value: number;
  readonly label: string;
}

export const MONTH_OPTIONS: readonly MonthOption[] = MONTH_NAMES.map((label, index) => ({
  value: index + 1,
  label,
}));

/** Cria uma data local (00:00) validando dia, mês e ano. Mês de 1 a 12. */
export function createDate(year: number, month: number, day: number): Date | null {
  if (![year, month, day].every(Number.isInteger)) return null;
  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

/** Remove a parte de horário, mantendo o dia local. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Data de hoje às 00:00. */
export function today(): Date {
  return startOfDay(new Date());
}

/**
 * Converte o valor armazenado em data.
 * Aceita `dd/MM/yyyy`, `d/M/yyyy`, `dd/MM/yy`, ISO (`yyyy-MM-dd`), `Date` e Timestamp do Firestore.
 */
export function parseDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }

  if (typeof value === 'object' && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return parseDate((value as { toDate(): Date }).toDate());
  }

  if (typeof value !== 'string') return null;

  const text = value.trim();
  const br = BR_DATE.exec(text);
  if (br) {
    const yearText = br[3];
    const year = yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText);
    return createDate(year, Number(br[2]), Number(br[1]));
  }

  const iso = ISO_DATE.exec(text);
  if (iso) {
    return createDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  return null;
}

/** Formata como `dd/MM/yyyy` (formato de armazenamento). */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/**
 * Normaliza um valor de data vindo do banco para `dd/MM/yyyy`.
 * Se o valor não for uma data reconhecível, devolve o texto original para não esconder o dado.
 */
export function normalizeDateText(value: unknown): string {
  const date = parseDate(value);
  if (date) return formatDate(date);
  return value === null || value === undefined ? '' : String(value).trim();
}

/** Número sequencial do dia (independe de fuso e horário de verão). */
export function toDayNumber(date: Date): number {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

/** Quantidade de dias entre duas datas, contando o primeiro e o último dia. */
export function inclusiveDays(start: Date, end: Date): number {
  return toDayNumber(end) - toDayNumber(start) + 1;
}

/** Soma dias a uma data. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Indica se dois intervalos fechados [início, fim] têm pelo menos um dia em comum. */
export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return toDayNumber(aStart) <= toDayNumber(bEnd) && toDayNumber(bStart) <= toDayNumber(aEnd);
}

/** Indica se a data está dentro do intervalo fechado [início, fim]. */
export function isWithin(date: Date, start: Date, end: Date): boolean {
  const day = toDayNumber(date);
  return day >= toDayNumber(start) && day <= toDayNumber(end);
}

/** Nome do mês (1 a 12). */
export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? '';
}

/** Converte texto em mês válido (1 a 12) ou `null`. */
export function toMonth(value: unknown): number | null {
  const month = Number(value);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null;
}

/** Converte texto em ano válido ou `null`. */
export function toYear(value: unknown): number | null {
  const year = Number(value);
  return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR ? year : null;
}

/** "1 dia" / "30 dias". */
export function formatDayCount(days: number): string {
  return `${days} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`;
}

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
