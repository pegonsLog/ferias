import { Injectable, computed, inject } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';

import { compareText } from '../../domain/text';
import { UserProfile, userFromRecord } from '../../domain/user';
import { hashPassword } from '../auth/password';
import { SessionStore } from '../auth/session-store';
import { COLLECTIONS, FIRESTORE } from './firebase';
import { LiveCollection } from './live-collection';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private readonly db = inject(FIRESTORE);
  private readonly live = new LiveCollection(
    collection(this.db, COLLECTIONS.users),
    userFromRecord,
    inject(SessionStore).isAuthenticated,
  );

  /** Usuários em ordem alfabética (sem senha). */
  readonly users = computed(() =>
    [...this.live.items()].sort((a, b) => compareText(a.name, b.name)),
  );
  readonly status = this.live.status;
  readonly loading = this.live.loading;

  reload(): void {
    this.live.connect();
  }

  isUsernameTaken(username: string, ignoreId?: string): boolean {
    const key = username.trim();
    return this.users().some((user) => user.id !== ignoreId && user.username === key);
  }

  async create(profile: UserProfile, password: string): Promise<string> {
    const ref = await addDoc(collection(this.db, COLLECTIONS.users), {
      ...profile,
      password: await hashPassword(password),
    });
    return ref.id;
  }

  /** Atualiza o cadastro. A senha só é trocada quando uma nova for informada. */
  async update(id: string, profile: UserProfile, newPassword?: string): Promise<void> {
    const data: Record<string, string> = { ...profile };
    if (newPassword) data['password'] = await hashPassword(newPassword);
    await updateDoc(doc(this.db, COLLECTIONS.users, id), data);
  }

  remove(id: string): Promise<void> {
    return deleteDoc(doc(this.db, COLLECTIONS.users, id));
  }
}
