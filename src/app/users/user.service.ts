import { Injectable } from '@angular/core';

import { initializeApp } from 'firebase/app';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../shared/models/user';
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

@Injectable({ providedIn: 'root' })
export class UserService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  users: User[] = [];
  user: User = {
    id: '',
    username: '',
    name: '',
    password: '',
    gender: '',
  };

  constructor(private firestore: Firestore) {}

  list() {
    let $userRef = collection(this.firestore, 'users');
    return collectionData($userRef, { idField: 'id' }) as Observable<User[]>;
  }

  findOne(id: string) {
    let $userRef = doc(this.db, 'users/' + id);
    return docData($userRef, { idField: 'id' }) as Observable<User>;
  }

  delete(id: string) {
    let $userRef = doc(this.db, 'users/' + id);
    return deleteDoc($userRef);
  }

  addUser(user: User) {
    let $userRef = collection(this.db, 'users');
    return addDoc($userRef, user);
  }

  update(user: User, id: string) {
    let $userRef = doc(this.db, 'users/' + id);
    return setDoc($userRef, user);
  }
}
