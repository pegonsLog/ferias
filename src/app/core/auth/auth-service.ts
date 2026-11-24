import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Unsubscribe,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { AppUser, userFromRecord } from '../../domain/user';
import { COLLECTIONS, FIRESTORE } from '../data/firebase';
import { AppError } from '../errors';
import { verifyPassword } from './password';
import { SessionStore } from './session-store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly db = inject(FIRESTORE);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  /**
   * Valida usuário e senha consultando apenas o cadastro com o usuário informado
   * (a versão anterior baixava todos os usuários e senhas para o navegador).
   */
  async login(username: string, password: string): Promise<AppUser> {
    const login = username.trim();
    if (!login || !password) throw new AppError('Informe usuário e senha.');

    const snapshot = await getDocs(
      query(collection(this.db, COLLECTIONS.users), where('username', '==', login)),
    );

    for (const candidate of snapshot.docs) {
      const data = candidate.data();
      const stored = typeof data['password'] === 'string' ? data['password'] : '';
      if (await verifyPassword(password, stored)) {
        const user = userFromRecord(candidate.id, data);
        this.session.start(user);
        return user;
      }
    }

    throw new AppError('Usuário ou senha inválidos.');
  }

  logout(): void {
    this.session.clear();
    void this.router.navigateByUrl('/login');
  }

  /**
   * Acompanha o cadastro do usuário logado: atualiza nome/sexo exibidos e encerra a sessão
   * se o usuário for excluído.
   */
  watchCurrentUser(): Unsubscribe {
    const user = this.session.user();
    if (!user) return () => undefined;

    return onSnapshot(
      doc(this.db, COLLECTIONS.users, user.id),
      (snapshot) => {
        if (!snapshot.exists()) {
          if (!snapshot.metadata.fromCache) this.logout();
          return;
        }
        this.session.refresh(userFromRecord(snapshot.id, snapshot.data()));
      },
      (error) => console.warn('[Auth] Não foi possível acompanhar o usuário logado', error),
    );
  }
}
