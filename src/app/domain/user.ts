import { firstName } from './text';

export const GENDERS = ['Masculino', 'Feminino'] as const;

/** Usuário do sistema (coleção `users`), sem a senha. */
export interface AppUser {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly gender: string;
}

/** Campos editáveis de um usuário (a senha é tratada à parte). */
export type UserProfile = Omit<AppUser, 'id'>;

function text(value: unknown): string {
  return value === null || value === undefined ? '' : String(value).trim();
}

/** Converte um documento do Firestore em `AppUser`. A senha nunca é mantida em memória. */
export function userFromRecord(id: string, raw: Readonly<Record<string, unknown>>): AppUser {
  return {
    id,
    username: text(raw['username']),
    name: text(raw['name']),
    gender: text(raw['gender']),
  };
}

/** Saudação respeitando o gênero cadastrado. */
export function greeting(name: string, gender: string): string {
  const first = firstName(name);
  const who = first ? `, ${first}` : '';
  if (gender === 'Masculino') return `Bem-vindo${who}`;
  if (gender === 'Feminino') return `Bem-vinda${who}`;
  return `Olá${who}`;
}
