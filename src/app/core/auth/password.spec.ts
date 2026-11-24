import { safeReturnUrl } from './auth-guards';
import { hashPassword, isHashedPassword, verifyPassword } from './password';

describe('password', () => {
  it('gera hash com salt aleatório e valida a senha correta', async () => {
    const first = await hashPassword('1234', 1000);
    const second = await hashPassword('1234', 1000);

    expect(isHashedPassword(first)).toBe(true);
    expect(first).not.toContain('1234');
    expect(first).not.toBe(second);
    expect(await verifyPassword('1234', first)).toBe(true);
    expect(await verifyPassword('4321', first)).toBe(false);
  });

  it('continua aceitando senhas antigas em texto puro', async () => {
    expect(await verifyPassword('1234', '1234')).toBe(true);
    expect(await verifyPassword('123', '1234')).toBe(false);
  });

  it('recusa valores vazios ou corrompidos', async () => {
    expect(await verifyPassword('', '')).toBe(false);
    expect(await verifyPassword('1234', 'pbkdf2_sha256$abc$$')).toBe(false);
    expect(await verifyPassword('1234', 'pbkdf2_sha256$1000$***$***')).toBe(false);
  });
});

describe('safeReturnUrl', () => {
  it('aceita apenas caminhos internos', () => {
    expect(safeReturnUrl('/funcionarios')).toBe('/funcionarios');
    expect(safeReturnUrl('//site-externo.com')).toBe('/inicio');
    expect(safeReturnUrl('https://site-externo.com')).toBe('/inicio');
    expect(safeReturnUrl('/login')).toBe('/inicio');
    expect(safeReturnUrl(undefined)).toBe('/inicio');
  });
});
