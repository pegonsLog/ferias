import {
  EmployeeData,
  employeeFromRecord,
  filterByNameOrRegistration,
  vacationFieldsChanged,
} from './employee';
import { greeting } from './user';

const base: EmployeeData = {
  registration: '123',
  name: 'Maria',
  office: 'Coletora',
  shift: 'Manhã',
  admission: '10/01/2015',
  admission2: '',
};

describe('employee', () => {
  it('employeeFromRecord normaliza campos nulos e datas', () => {
    expect(
      employeeFromRecord('e1', {
        registration: 123,
        name: ' Maria ',
        admission: '1/2/15',
        admission2: null,
      }),
    ).toEqual({
      id: 'e1',
      registration: '123',
      name: 'Maria',
      office: '',
      shift: '',
      admission: '01/02/2015',
      admission2: '',
    });
  });

  it('vacationFieldsChanged só considera os dados copiados para as férias', () => {
    expect(vacationFieldsChanged(base, { ...base, shift: 'Noite' })).toBe(false);
    expect(vacationFieldsChanged(base, { ...base, admission2: '01/01/2020' })).toBe(false);
    expect(vacationFieldsChanged(base, { ...base, name: 'Maria José' })).toBe(true);
    expect(vacationFieldsChanged(base, { ...base, registration: '124' })).toBe(true);
  });

  it('filterByNameOrRegistration busca por nome ou matrícula', () => {
    const list = [
      { name: 'Maria', registration: '123' },
      { name: 'João', registration: '456' },
    ];
    expect(filterByNameOrRegistration(list, 'joao')).toEqual([list[1]]);
    expect(filterByNameOrRegistration(list, '12')).toEqual([list[0]]);
    expect(filterByNameOrRegistration(list, '', 1)).toEqual([list[0]]);
  });
});

describe('greeting', () => {
  it('respeita o gênero cadastrado', () => {
    expect(greeting('JOÃO DA SILVA', 'Masculino')).toBe('Bem-vindo, João');
    expect(greeting('Maria', 'Feminino')).toBe('Bem-vinda, Maria');
    expect(greeting('Alex', '')).toBe('Olá, Alex');
  });
});
