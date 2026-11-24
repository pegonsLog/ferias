import {
  EMPTY_FILTERS,
  NOT_INFORMED,
  VacationFilters,
  activeFilterCount,
  buildFilterOptions,
  filterVacations,
} from './vacation-filters';
import { Vacation, VacationEntry, toEntry } from './vacation';

const reference = new Date(2026, 5, 15); // 15/06/2026

function vacation(overrides: Partial<Vacation>): VacationEntry {
  return toEntry({
    id: overrides.id ?? 'x',
    registration: '1',
    name: 'Maria',
    office: 'Coletora',
    admission: '',
    startVacation: '01/03/2026',
    endVacation: '30/03/2026',
    days: 30,
    limit: '',
    purchasing: '2025/2026',
    period: 'Único',
    intprop: 'Int',
    sell: 'Não',
    observation: '',
    ...overrides,
  });
}

const entries = [
  vacation({ id: 'a', name: 'Maria Souza', office: 'Coletora', sell: 'Sim' }),
  vacation({
    id: 'b',
    name: 'João Lima',
    registration: '22',
    office: 'motorista',
    startVacation: '10/06/2026',
    endVacation: '24/06/2026',
    period: '1º Per',
    sell: '',
    observation: 'Combinado com a supervisão',
  }),
  vacation({
    id: 'c',
    name: 'Ana Reis',
    office: 'Motorista',
    startVacation: '01/09/2026',
    endVacation: '20/09/2026',
    intprop: 'Prop',
    purchasing: '2024/2025',
  }),
];

const ids = (filters: Partial<VacationFilters>) =>
  filterVacations(entries, { ...EMPTY_FILTERS, ...filters }, reference).map((entry) => entry.id);

describe('vacation filters', () => {
  it('sem filtros devolve tudo', () => {
    expect(ids({})).toEqual(['a', 'b', 'c']);
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
  });

  it('filtra por mês de início e situação', () => {
    expect(ids({ month: 6 })).toEqual(['b']);
    expect(ids({ status: 'finished' })).toEqual(['a']);
    expect(ids({ status: 'ongoing' })).toEqual(['b']);
    expect(ids({ status: 'scheduled' })).toEqual(['c']);
  });

  it('compara cargos sem diferenciar maiúsculas e combina filtros com "E"', () => {
    expect(ids({ office: 'Motorista' })).toEqual(['b', 'c']);
    expect(ids({ office: 'Motorista', intprop: 'Prop' })).toEqual(['c']);
    expect(ids({ purchasing: '2025/2026', period: '1º Per' })).toEqual(['b']);
  });

  it('"Não informado" encontra campos vazios', () => {
    expect(ids({ sell: NOT_INFORMED })).toEqual(['b']);
    expect(ids({ sell: 'Sim' })).toEqual(['a']);
  });

  it('a busca livre olha nome, matrícula, cargo e observações', () => {
    expect(ids({ search: 'joao' })).toEqual(['b']);
    expect(ids({ search: '22' })).toEqual(['b']);
    expect(ids({ search: 'supervisao' })).toEqual(['b']);
    expect(ids({ search: 'motorista ana' })).toEqual(['c']);
  });

  it('conta os filtros ativos', () => {
    expect(
      activeFilterCount({ ...EMPTY_FILTERS, search: ' x ', month: 1, sell: NOT_INFORMED }),
    ).toBe(3);
    expect(activeFilterCount({ ...EMPTY_FILTERS, search: '   ' })).toBe(0);
  });

  describe('opções', () => {
    const options = buildFilterOptions(entries, EMPTY_FILTERS, reference);

    it('agrupa valores iguais, conta e deixa "Não informado" por último', () => {
      expect(options.offices).toEqual([
        { value: 'Coletora', label: 'Coletora', count: 1 },
        { value: 'motorista', label: 'motorista', count: 2 },
      ]);
      expect(options.sell.map((option) => [option.label, option.count])).toEqual([
        ['Não', 1],
        ['Sim', 1],
        ['Não informado', 1],
      ]);
    });

    it('usa rótulos descritivos para Int/Prop e conta meses e situações', () => {
      expect(options.intprop.map((option) => option.label)).toEqual([
        'Integral (Int)',
        'Proporcional (Prop)',
      ]);
      expect(options.months).toHaveLength(12);
      expect(options.months[2].count).toBe(1);
      expect(options.statuses.map((option) => option.value)).toEqual([
        'scheduled',
        'ongoing',
        'finished',
      ]);
    });

    it('mantém visível um valor selecionado que não existe nos dados', () => {
      const withMissing = buildFilterOptions(
        entries,
        { ...EMPTY_FILTERS, office: 'Fiscal' },
        reference,
      );
      expect(withMissing.offices).toContainEqual({ value: 'Fiscal', label: 'Fiscal', count: 0 });
    });
  });
});
