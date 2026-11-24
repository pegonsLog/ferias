import {
  createDate,
  formatDate,
  formatDayCount,
  inclusiveDays,
  isWithin,
  normalizeDateText,
  parseDate,
  rangesOverlap,
  toMonth,
  toYear,
} from './dates';

const d = (year: number, month: number, day: number) => new Date(year, month - 1, day);

describe('dates', () => {
  describe('parseDate', () => {
    it('interpreta o formato de armazenamento dd/MM/yyyy', () => {
      expect(parseDate('01/08/2023')).toEqual(d(2023, 8, 1));
      expect(parseDate(' 31/12/2024 ')).toEqual(d(2024, 12, 31));
    });

    it('aceita dia/mês sem zero e ano com 2 dígitos', () => {
      expect(parseDate('1/8/2023')).toEqual(d(2023, 8, 1));
      expect(parseDate('01/08/23')).toEqual(d(2023, 8, 1));
    });

    it('aceita ISO, Date e Timestamp do Firestore', () => {
      expect(parseDate('2023-08-01')).toEqual(d(2023, 8, 1));
      expect(parseDate(new Date(2023, 7, 1, 15, 30))).toEqual(d(2023, 8, 1));
      expect(parseDate({ toDate: () => new Date(2023, 7, 1, 10) })).toEqual(d(2023, 8, 1));
    });

    it('rejeita datas inexistentes ou incompletas', () => {
      expect(parseDate('31/02/2023')).toBeNull();
      expect(parseDate('dd/mm/yyyy')).toBeNull();
      expect(parseDate('12/0m/yyyy')).toBeNull();
      expect(parseDate('')).toBeNull();
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
      expect(parseDate(42)).toBeNull();
    });

    it('rejeita anos fora da faixa aceita', () => {
      expect(parseDate('01/01/0023')).toBeNull();
      expect(createDate(2300, 1, 1)).toBeNull();
    });
  });

  it('formatDate usa dd/MM/yyyy e devolve vazio para nulo', () => {
    expect(formatDate(d(2023, 8, 1))).toBe('01/08/2023');
    expect(formatDate(null)).toBe('');
  });

  it('normalizeDateText padroniza datas e preserva textos não reconhecidos', () => {
    expect(normalizeDateText('1/8/23')).toBe('01/08/2023');
    expect(normalizeDateText('texto livre')).toBe('texto livre');
    expect(normalizeDateText(null)).toBe('');
  });

  describe('inclusiveDays', () => {
    it('conta o primeiro e o último dia', () => {
      expect(inclusiveDays(d(2023, 8, 1), d(2023, 8, 30))).toBe(30);
      expect(inclusiveDays(d(2023, 8, 1), d(2023, 8, 1))).toBe(1);
    });

    it('atravessa meses, anos bissextos e mudanças de horário de verão', () => {
      expect(inclusiveDays(d(2024, 2, 20), d(2024, 3, 10))).toBe(20);
      expect(inclusiveDays(d(2018, 10, 20), d(2018, 11, 18))).toBe(30);
      expect(inclusiveDays(d(2023, 12, 20), d(2024, 1, 18))).toBe(30);
    });
  });

  it('rangesOverlap considera intervalos fechados', () => {
    expect(rangesOverlap(d(2023, 8, 1), d(2023, 8, 10), d(2023, 8, 10), d(2023, 8, 20))).toBe(true);
    expect(rangesOverlap(d(2023, 8, 1), d(2023, 8, 10), d(2023, 8, 11), d(2023, 8, 20))).toBe(
      false,
    );
    expect(rangesOverlap(d(2023, 8, 5), d(2023, 8, 6), d(2023, 8, 1), d(2023, 8, 30))).toBe(true);
  });

  it('isWithin inclui as extremidades', () => {
    expect(isWithin(d(2023, 8, 1), d(2023, 8, 1), d(2023, 8, 30))).toBe(true);
    expect(isWithin(d(2023, 8, 31), d(2023, 8, 1), d(2023, 8, 30))).toBe(false);
  });

  it('toMonth e toYear validam parâmetros de URL', () => {
    expect(toMonth('08')).toBe(8);
    expect(toMonth('13')).toBeNull();
    expect(toMonth(undefined)).toBeNull();
    expect(toYear('2023')).toBe(2023);
    expect(toYear('abc')).toBeNull();
  });

  it('formatDayCount usa singular e plural', () => {
    expect(formatDayCount(1)).toBe('1 dia');
    expect(formatDayCount(30)).toBe('30 dias');
  });
});
