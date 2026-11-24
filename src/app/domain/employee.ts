import { normalizeDateText } from './dates';
import { matchesSearch } from './text';

/** Funcionário (coleção `employees`). Datas no formato `dd/MM/yyyy`. */
export interface Employee {
  readonly id: string;
  readonly registration: string;
  readonly name: string;
  readonly office: string;
  readonly shift: string;
  readonly admission: string;
  /** Data da segunda admissão (readmissão). Vazio quando não houver. */
  readonly admission2: string;
}

/** Campos gravados no Firestore. */
export type EmployeeData = Omit<Employee, 'id'>;

/** Campos copiados para os registros de férias (desnormalizados). */
export const EMPLOYEE_FIELDS_IN_VACATION = ['registration', 'name', 'office', 'admission'] as const;

/** Indica se alguma informação replicada nas férias mudou. */
export function vacationFieldsChanged(before: EmployeeData, after: EmployeeData): boolean {
  return EMPLOYEE_FIELDS_IN_VACATION.some((field) => before[field] !== after[field]);
}

export function employeeLabel(employee: Pick<Employee, 'name' | 'registration'>): string {
  return `${employee.name} · Mat. ${employee.registration}`;
}

/** Filtra por nome ou matrícula (sem diferenciar acentos), limitando a quantidade de sugestões. */
export function filterByNameOrRegistration<T extends Pick<Employee, 'name' | 'registration'>>(
  items: readonly T[],
  term: string,
  limit = 50,
): T[] {
  return items.filter((item) => matchesSearch(term, item.name, item.registration)).slice(0, limit);
}

function text(value: unknown): string {
  return value === null || value === undefined ? '' : String(value).trim();
}

/** Converte um documento do Firestore em `Employee`, tolerando campos ausentes ou nulos. */
export function employeeFromRecord(id: string, raw: Readonly<Record<string, unknown>>): Employee {
  return {
    id,
    registration: text(raw['registration']),
    name: text(raw['name']),
    office: text(raw['office']),
    shift: text(raw['shift']),
    admission: normalizeDateText(raw['admission']),
    admission2: normalizeDateText(raw['admission2']),
  };
}
