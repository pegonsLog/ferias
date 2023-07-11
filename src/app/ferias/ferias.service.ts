import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Ferias } from '../shared/models/ferias';
import { initializeApp } from '@angular/fire/app';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, getFirestore, setDoc } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeriasService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);
  subscription: Subscription = new Subscription();

  feriasList: Ferias[] = [];
  vacations: Ferias = {
    id: '',
    registration: '',
    startVacation: new Date(),
    endVacation: new Date(),

  };

  constructor(private firestore: Firestore) {}

  list() {
    let $feriasRef = collection(this.firestore, 'vacations');
    return collectionData($feriasRef, { idField: 'id' }) as Observable<
      Ferias[]
    >;
  }

  findOne(id: string) {
    let $feriasRef = doc(this.db, 'vacations/' + id);
    return docData($feriasRef, {
      idField: 'id',
    }) as Observable<Ferias>;
  }

  delete(id: string) {
    let $feriasRef = doc(this.db, 'vacations/' + id);
    return deleteDoc($feriasRef);
  }

  feriasAdd(vacations: Ferias) {
    let $feriasRef = collection(this.db, 'vacations');
    return addDoc($feriasRef, vacations);
  }

  update(vacations: Ferias, id: string) {
    let $feriasRef = doc(this.db, 'vacations/' + id);
    return setDoc($feriasRef, vacations);
  }
}
