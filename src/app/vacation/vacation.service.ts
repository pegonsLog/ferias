import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Vacation } from '../shared/models/vacation';
import { initializeApp } from '@angular/fire/app';
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
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VacationService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);
  subscription: Subscription = new Subscription();

  vacationList: Vacation[] = [];
  vacations: Vacation = {
    id: '',
    registration: '',
    startVacation: new Date(),
    endVacation: new Date(),
    limit: new Date(),
    period: new Date(),
    intprop: '',
    sell: '',
    observation: '',
  };

  constructor(private firestore: Firestore) {}

  list() {
    let $vacationRef = collection(this.firestore, 'vacations');
    return collectionData($vacationRef, { idField: 'id' }) as Observable<
      Vacation[]
    >;
  }

  findOne(id: string) {
    let $vacationRef = doc(this.db, 'vacations/' + id);
    return docData($vacationRef, {
      idField: 'id',
    }) as Observable<Vacation>;
  }

  delete(id: string) {
    let $vacationRef = doc(this.db, 'vacations/' + id);
    return deleteDoc($vacationRef);
  }

  vacationAdd(vacation: Vacation) {
    let $vacationRef = collection(this.db, 'vacations');
    return addDoc($vacationRef, vacation);
  }

  update(vacation: Vacation, id: string) {
    let $vacationRef = doc(this.db, 'vacations/' + id);
    return setDoc($vacationRef, vacation);
  }
}
