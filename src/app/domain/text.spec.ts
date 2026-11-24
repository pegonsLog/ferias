import {
  collapseSpaces,
  distinctSorted,
  firstName,
  initials,
  matchesSearch,
  normalizeText,
} from './text';

describe('text', () => {
  it('normalizeText remove acentos e caixa', () => {
    expect(normalizeText('  JOÃO Conceição ')).toBe('joao conceicao');
    expect(normalizeText(null)).toBe('');
  });

  it('matchesSearch exige todos os termos em qualquer campo', () => {
    expect(matchesSearch('joao 123', 'João da Silva', '1234')).toBe(true);
    expect(matchesSearch('maria 123', 'João da Silva', '1234')).toBe(false);
    expect(matchesSearch('', 'qualquer')).toBe(true);
  });

  it('collapseSpaces remove espaços repetidos', () => {
    expect(collapseSpaces('  Ana   Paula  ')).toBe('Ana Paula');
  });

  it('initials ignora preposições', () => {
    expect(initials('Maria da Silva')).toBe('MS');
    expect(initials('josé dos santos')).toBe('JS');
    expect(initials('Carlos')).toBe('C');
    expect(initials('')).toBe('?');
  });

  it('firstName ajusta a capitalização', () => {
    expect(firstName('MARIA DA SILVA')).toBe('Maria');
    expect(firstName('joão')).toBe('João');
    expect(firstName('')).toBe('');
  });

  it('distinctSorted remove duplicados ignorando acentos e caixa', () => {
    expect(distinctSorted(['Motorista', 'motorista', ' Ajudante ', '', 'Coletor'])).toEqual([
      'Ajudante',
      'Coletor',
      'Motorista',
    ]);
  });
});
