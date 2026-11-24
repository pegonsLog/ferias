import { sortRows } from './sort';

interface Row {
  readonly name: string;
  readonly value: number | null;
}

const rows: Row[] = [
  { name: 'Bruno', value: 3 },
  { name: 'ana', value: null },
  { name: 'Álvaro', value: 10 },
  { name: 'Carla', value: 1 },
];

const accessors = { name: (row: Row) => row.name, value: (row: Row) => row.value };

describe('sortRows', () => {
  it('ordena texto em português sem diferenciar acentos e caixa', () => {
    const sorted = sortRows(rows, { active: 'name', direction: 'asc' }, accessors);
    expect(sorted.map((row) => row.name)).toEqual(['Álvaro', 'ana', 'Bruno', 'Carla']);
  });

  it('ordena números e mantém vazios no fim nas duas direções', () => {
    const asc = sortRows(rows, { active: 'value', direction: 'asc' }, accessors);
    const desc = sortRows(rows, { active: 'value', direction: 'desc' }, accessors);
    expect(asc.map((row) => row.value)).toEqual([1, 3, 10, null]);
    expect(desc.map((row) => row.value)).toEqual([10, 3, 1, null]);
  });

  it('não altera o array original e ignora colunas desconhecidas', () => {
    const copy = [...rows];
    expect(sortRows(rows, { active: 'x', direction: 'asc' }, accessors)).toEqual(copy);
    expect(rows).toEqual(copy);
  });

  it('ordena matrículas numéricas de forma natural', () => {
    const items = [
      { name: '100', value: 0 },
      { name: '20', value: 0 },
      { name: '3', value: 0 },
    ];
    const sorted = sortRows(items, { active: 'name', direction: 'asc' }, accessors);
    expect(sorted.map((row) => row.name)).toEqual(['3', '20', '100']);
  });
});
