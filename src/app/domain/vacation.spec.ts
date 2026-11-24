import { Employee } from './employee';
import {
  Vacation,
  VacationEntry,
  acquisitionPeriodOptions,
  buildVacationData,
  compareByStart,
  findOverlap,
  ongoingOn,
  startsInMonth,
  startsInYear,
  sumDays,
  toEntry,
  upcoming,
  vacationFromRecord,
  vacationPeople,
  vacationStatus,
  yearOptions,
} from './vacation';

const d = (year: number, month: number, day: number) => new Date(year, month - 1, day);

function vacation(overrides: Partial<Vacation> = {}): VacationEntry {
  return toEntry({
    id: 'v1',
    registration: '123',
    name: 'Maria',
    office: 'Coletora',
    admission: '10/01/2015',
    startVacation: '01/08/2023',
    endVacation: '30/08/2023',
    days: 30,
    limit: '',
    purchasing: '2022/2023',
    period: 'Único',
    intprop: 'Int',
    sell: 'Não',
    observation: '',
    ...overrides,
  });
}

const employee: Employee = {
  id: 'e1',
  registration: '123',
  name: 'Maria',
  office: 'Coletora',
  shift: 'Manhã',
  admission: '10/01/2015',
  admission2: '',
};

describe('vacation', () => {
  it('vacationFromRecord tolera campos nulos e o campo id legado', () => {
    const result = vacationFromRecord('abc', {
      id: '',
      registration: ' 123 ',
      name: 'Maria',
      startVacation: '1/8/23',
      endVacation: '30/08/2023',
      days: '30',
      limit: null,
      sell: null,
    });
    expect(result.id).toBe('abc');
    expect(result.registration).toBe('123');
    expect(result.startVacation).toBe('01/08/2023');
    expect(result.days).toBe(30);
    expect(result.limit).toBe('');
    expect(result.sell).toBe('');
    expect(result.office).toBe('');
  });

  it('toEntry recalcula os dias a partir das datas', () => {
    expect(vacation({ days: 29 }).totalDays).toBe(30);
    expect(vacation({ startVacation: 'inválida', days: 12 }).totalDays).toBe(12);
  });

  it('buildVacationData grava datas em dd/MM/yyyy e copia os dados do funcionário', () => {
    const data = buildVacationData(employee, {
      start: d(2023, 8, 1),
      end: d(2023, 8, 20),
      limit: null,
      purchasing: '2022/2023',
      period: '1º Per',
      intprop: 'Int',
      sell: 'Sim',
      observation: '  linha   1 \n linha 2 ',
    });
    expect(data).toEqual({
      registration: '123',
      name: 'Maria',
      office: 'Coletora',
      admission: '10/01/2015',
      startVacation: '01/08/2023',
      endVacation: '20/08/2023',
      days: 20,
      limit: '',
      purchasing: '2022/2023',
      period: '1º Per',
      intprop: 'Int',
      sell: 'Sim',
      observation: 'linha 1\nlinha 2',
    });
  });

  it('vacationStatus indica agendada, em andamento e concluída', () => {
    const entry = vacation();
    expect(vacationStatus(entry, d(2023, 7, 31))).toBe('scheduled');
    expect(vacationStatus(entry, d(2023, 8, 1))).toBe('ongoing');
    expect(vacationStatus(entry, d(2023, 8, 30))).toBe('ongoing');
    expect(vacationStatus(entry, d(2023, 8, 31))).toBe('finished');
    expect(vacationStatus(vacation({ endVacation: '' }))).toBe('invalid');
  });

  it('filtra pelo mês e ano de início (inclusive para datas fora do padrão)', () => {
    const entry = vacation({ startVacation: '1/8/2023' });
    expect(startsInMonth(entry, 8, 2023)).toBe(true);
    expect(startsInMonth(entry, 9, 2023)).toBe(false);
    expect(startsInYear(entry, 2023)).toBe(true);
    expect(startsInYear(entry, 2024)).toBe(false);
  });

  describe('findOverlap', () => {
    const entries = [
      vacation({ id: 'a' }),
      vacation({
        id: 'b',
        registration: '999',
        startVacation: '01/09/2023',
        endVacation: '10/09/2023',
      }),
    ];

    it('encontra conflito do mesmo funcionário', () => {
      expect(findOverlap(entries, '123', d(2023, 8, 30), d(2023, 9, 5))?.id).toBe('a');
    });

    it('ignora outros funcionários, períodos livres e o próprio registro em edição', () => {
      expect(findOverlap(entries, '123', d(2023, 8, 31), d(2023, 9, 5))).toBeUndefined();
      expect(findOverlap(entries, '555', d(2023, 8, 1), d(2023, 8, 5))).toBeUndefined();
      expect(findOverlap(entries, '123', d(2023, 8, 1), d(2023, 8, 5), 'a')).toBeUndefined();
    });
  });

  it('ongoingOn e upcoming selecionam as férias certas', () => {
    const entries = [
      vacation({ id: 'now', startVacation: '20/11/2026', endVacation: '05/12/2026' }),
      vacation({ id: 'soon', startVacation: '10/12/2026', endVacation: '20/12/2026' }),
      vacation({ id: 'later', startVacation: '10/02/2027', endVacation: '20/02/2027' }),
    ];
    const reference = d(2026, 11, 24);
    expect(ongoingOn(entries, reference).map((e) => e.id)).toEqual(['now']);
    expect(upcoming(entries, reference, 30).map((e) => e.id)).toEqual(['soon']);
  });

  it('compareByStart ordena cronologicamente com datas inválidas no fim', () => {
    const sorted = [
      vacation({ id: 'x', startVacation: '' }),
      vacation({ id: 'b', startVacation: '10/08/2023' }),
      vacation({ id: 'a', startVacation: '01/08/2023' }),
    ].sort(compareByStart);
    expect(sorted.map((e) => e.id)).toEqual(['a', 'b', 'x']);
  });

  it('sumDays soma apenas valores positivos', () => {
    expect(sumDays([vacation(), vacation({ startVacation: '', days: -3 })])).toBe(30);
  });

  it('acquisitionPeriodOptions inclui a faixa padrão e valores já gravados', () => {
    const options = acquisitionPeriodOptions(['2010/2011', ' 2023/2024 '], d(2026, 1, 1));
    expect(options[0]).toBe('2010/2011');
    expect(options).toContain('2020/2021');
    expect(options).toContain('2029/2030');
    expect(new Set(options).size).toBe(options.length);
  });

  it('yearOptions inclui anos com férias e fica em ordem decrescente', () => {
    const years = yearOptions([vacation({ startVacation: '01/01/2012' })], d(2026, 1, 1));
    expect(years[0]).toBe(2028);
    expect(years).toContain(2021);
    expect(years.at(-1)).toBe(2012);
  });

  it('vacationPeople inclui matrículas que só existem nas férias', () => {
    const people = vacationPeople(
      [employee],
      [vacation(), vacation({ id: 'z', registration: '777', name: 'Ex-funcionário' })],
    );
    expect(people).toEqual([
      expect.objectContaining({ registration: '777', registered: false }),
      expect.objectContaining({ registration: '123', registered: true }),
    ]);
  });
});
