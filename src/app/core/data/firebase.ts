import { InjectionToken, inject } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

import { environment } from '../../../environments/environment';

/** Instância única do Firebase, criada sob demanda. */
export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP', {
  providedIn: 'root',
  factory: () => initializeApp(environment.firebase),
});

/** Instância única do Firestore, compartilhada por todos os repositórios. */
export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE', {
  providedIn: 'root',
  factory: () => getFirestore(inject(FIREBASE_APP)),
});

/** Nomes das coleções (mantidos iguais aos da versão anterior). */
export const COLLECTIONS = {
  users: 'users',
  employees: 'employees',
  vacations: 'vacations',
} as const;
