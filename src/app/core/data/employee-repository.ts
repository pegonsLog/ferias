import { Injectable, computed, inject } from '@angular/core';
import {
  DocumentReference,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import {
  Employee,
  EmployeeData,
  employeeFromRecord,
  vacationFieldsChanged,
} from '../../domain/employee';
import { compareText } from '../../domain/text';
import { SessionStore } from '../auth/session-store';
import { COLLECTIONS, FIRESTORE } from './firebase';
import { LiveCollection } from './live-collection';
import { VacationRepository } from './vacation-repository';

/** O Firestore aceita até 500 operações por lote; mantemos uma folga. */
const MAX_BATCH_WRITES = 450;

@Injectable({ providedIn: 'root' })
export class EmployeeRepository {
  private readonly db = inject(FIRESTORE);
  private readonly vacations = inject(VacationRepository);
  private readonly live = new LiveCollection(
    collection(this.db, COLLECTIONS.employees),
    employeeFromRecord,
    inject(SessionStore).isAuthenticated,
  );

  /** Funcionários em ordem alfabética, atualizados em tempo real. */
  readonly employees = computed(() =>
    [...this.live.items()].sort((a, b) => compareText(a.name, b.name)),
  );
  readonly status = this.live.status;
  readonly loading = this.live.loading;

  reload(): void {
    this.live.connect();
  }

  findByRegistration(registration: string): Employee | undefined {
    const key = registration.trim();
    return key ? this.employees().find((employee) => employee.registration === key) : undefined;
  }

  isRegistrationTaken(registration: string, ignoreId?: string): boolean {
    const key = registration.trim();
    return this.employees().some(
      (employee) => employee.id !== ignoreId && employee.registration === key,
    );
  }

  async create(data: EmployeeData): Promise<string> {
    const ref = await addDoc(collection(this.db, COLLECTIONS.employees), { ...data });
    return ref.id;
  }

  /**
   * Atualiza o funcionário e replica matrícula, nome, cargo e admissão nas férias dele,
   * mantendo as listagens e a impressão coerentes. Retorna quantas férias foram atualizadas.
   */
  async update(current: Employee, data: EmployeeData): Promise<number> {
    const employeeRef = doc(this.db, COLLECTIONS.employees, current.id);

    if (!vacationFieldsChanged(current, data)) {
      await updateDoc(employeeRef, { ...data });
      return 0;
    }

    // Consulta exata no banco + registros já carregados (cobre matrículas antigas gravadas com
    // espaços extras, que a consulta exata não encontraria).
    const vacations = await getDocs(
      query(
        collection(this.db, COLLECTIONS.vacations),
        where('registration', '==', current.registration),
      ),
    );
    const refs = new Map<string, DocumentReference>();
    for (const snapshot of vacations.docs) refs.set(snapshot.id, snapshot.ref);
    for (const entry of this.vacations.forRegistration(current.registration)) {
      refs.set(entry.id, doc(this.db, COLLECTIONS.vacations, entry.id));
    }
    const patch = {
      registration: data.registration,
      name: data.name,
      office: data.office,
      admission: data.admission,
    };

    // O primeiro lote inclui o funcionário: a alteração principal e as férias são gravadas juntas.
    let batch = writeBatch(this.db);
    batch.update(employeeRef, { ...data });
    let pending = 1;
    for (const ref of refs.values()) {
      if (pending >= MAX_BATCH_WRITES) {
        await batch.commit();
        batch = writeBatch(this.db);
        pending = 0;
      }
      batch.update(ref, patch);
      pending++;
    }
    await batch.commit();
    return refs.size;
  }

  remove(id: string): Promise<void> {
    return deleteDoc(doc(this.db, COLLECTIONS.employees, id));
  }
}
