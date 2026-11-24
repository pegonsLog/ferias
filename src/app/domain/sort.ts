import { compareText } from './text';

export type SortDirection = 'asc' | 'desc' | '';

/** Mesmo formato do evento `matSortChange` do Angular Material. */
export interface SortState {
  readonly active: string;
  readonly direction: SortDirection;
}

export type SortValue = string | number | null | undefined;

export type SortAccessors<T> = Readonly<Record<string, (row: T) => SortValue>>;

function isEmpty(value: SortValue): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Ordena uma cópia das linhas pela coluna ativa.
 * Valores vazios ficam sempre no final, independentemente da direção.
 */
export function sortRows<T>(rows: readonly T[], sort: SortState, accessors: SortAccessors<T>): T[] {
  const accessor = accessors[sort.active];
  if (!accessor || !sort.direction) return [...rows];
  const factor = sort.direction === 'asc' ? 1 : -1;

  return [...rows].sort((a, b) => {
    const left = accessor(a);
    const right = accessor(b);
    const leftEmpty = isEmpty(left);
    const rightEmpty = isEmpty(right);
    if (leftEmpty || rightEmpty) return leftEmpty === rightEmpty ? 0 : leftEmpty ? 1 : -1;
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
    return compareText(String(left), String(right)) * factor;
  });
}
