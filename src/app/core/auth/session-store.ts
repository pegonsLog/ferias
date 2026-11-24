import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

import { AppUser } from '../../domain/user';

const STORAGE_KEY = 'ferias.session';
/** Chaves gravadas pela versão anterior do sistema. */
const LEGACY_KEYS = ['login', 'user', 'gender'];

/**
 * Sessão do usuário logado, persistida no navegador.
 * Não depende do Firestore, por isso pode ser usada pelos guards sem carregar o banco.
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly storage = inject(DOCUMENT).defaultView?.localStorage ?? null;
  private readonly _user = signal<AppUser | null>(this.restore());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  constructor() {
    this.removeLegacyKeys();
    // Mantém as abas sincronizadas (ex.: sair em uma aba encerra a sessão nas demais).
    inject(DOCUMENT).defaultView?.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY || event.key === null) this._user.set(this.restore());
    });
  }

  start(user: AppUser): void {
    this._user.set(user);
    this.persist(user);
  }

  /** Atualiza os dados exibidos (nome, sexo) sem encerrar a sessão. */
  refresh(user: AppUser): void {
    const current = this._user();
    if (!current || current.id !== user.id) return;
    if (
      current.name === user.name &&
      current.gender === user.gender &&
      current.username === user.username
    ) {
      return;
    }
    this.start(user);
  }

  clear(): void {
    this._user.set(null);
    this.storage?.removeItem(STORAGE_KEY);
  }

  private persist(user: AppUser): void {
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  private restore(): AppUser | null {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<AppUser> | null;
      if (!parsed || typeof parsed.id !== 'string' || !parsed.id) return null;
      return {
        id: parsed.id,
        username: String(parsed.username ?? ''),
        name: String(parsed.name ?? ''),
        gender: String(parsed.gender ?? ''),
      };
    } catch {
      return null;
    }
  }

  private removeLegacyKeys(): void {
    for (const key of LEGACY_KEYS) this.storage?.removeItem(key);
  }
}
