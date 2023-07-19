import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  getFirestore,
  setDoc,
} from '@angular/fire/firestore';
import { initializeApp } from 'firebase/app';
import { Observable, first, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Employee } from '../shared/models/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  employees: Employee[] = [];
  employee: Employee = {
    id: '',
    registration: '',
    name: '',
    shift: '',
    office: '',
    admission: '',
    admission2: ''
  };

  constructor(private firestore: Firestore) {}

  list() {
    let $employeeRef = collection(this.firestore, 'employees');
    return collectionData($employeeRef, { idField: 'id' }) as Observable<
      Employee[]
    >;
  }
  listForMonth(birthdayMonth: string): Observable<Employee[]> {
    return this.list()
      .pipe(
        map((result: Employee[]) =>
          result.filter(
            (data: Employee) => data.admission.substring(3) === birthdayMonth
          )
        )
      )
      .pipe(first());
  }

  findOne(id: string) {
    let $employeeRef = doc(this.db, 'employees/' + id);
    return docData($employeeRef, {
      idField: 'id',
    }) as Observable<Employee>;
  }

  delete(id: string) {
    let $employeeRef = doc(this.db, 'employees/' + id);
    return deleteDoc($employeeRef);
  }

  employeeAdd(employee: Employee) {
    let $employeeRef = collection(this.db, 'employees');
    return addDoc($employeeRef, employee);
  }

  update(employee: Employee, id: string) {
    let $employeeRef = doc(this.db, 'employees/' + id);
    return setDoc($employeeRef, employee);
  }
}
