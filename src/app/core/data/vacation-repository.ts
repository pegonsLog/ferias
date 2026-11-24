import { Injectable, inject } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';

import {
  VacationData,
  VacationEntry,
  sameRegistration,
  toEntry,
  vacationFromRecord,
} from '../../domain/vacation';
import { SessionStore } from '../auth/session-store';
import { COLLECTIONS, FIRESTORE } from './firebase';
import { LiveCollection } from './live-collection';

@Injectable({ providedIn: 'root' })
export class VacationRepository {
  private readonly db = inject(FIRESTORE);
  private readonly live = new LiveCollection<VacationEntry>(
    collection(this.db, COLLECTIONS.vacations),
    (id, data) => toEntry(vacationFromRecord(id, data)),
    inject(SessionStore).isAuthenticated,
  );

  /** Todas as férias, com datas já interpretadas, atualizadas em tempo real. */
  readonly entries = this.live.items;
  readonly status = this.live.status;
  readonly loading = this.live.loading;

  reload(): void {
    this.live.connect();
  }

  forRegistration(registration: string): VacationEntry[] {
    return this.entries().filter((entry) => sameRegistration(entry.registration, registration));
  }

  async create(data: VacationData): Promise<string> {
    const ref = await addDoc(collection(this.db, COLLECTIONS.vacations), { ...data });
    return ref.id;
  }

  update(id: string, data: VacationData): Promise<void> {
    return updateDoc(doc(this.db, COLLECTIONS.vacations, id), { ...data });
  }

  remove(id: string): Promise<void> {
    return deleteDoc(doc(this.db, COLLECTIONS.vacations, id));
  }
}
