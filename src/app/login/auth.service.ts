import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  getFirestore,
} from '@angular/fire/firestore';
import { initializeApp } from 'firebase/app';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../shared/models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  users: User[] = [];
  user: User = {
    id: '',
    username: '',
    name: '',
    password: '',
    gender: ''
  };

  constructor(private firestore: Firestore) {}

  list() {
    let $userRef = collection(this.firestore, 'users');
    return collectionData($userRef, { idField: 'id' }) as Observable<User[]>;
  }

  toAuth() {
    localStorage.setItem('login', 'sim');
  }

  userLogged(user: string) {
    localStorage.setItem('user', user);
  }
  genderLogged(gender: string) {
    localStorage.setItem('gender', gender);
  }

  toUnlogin() {
    localStorage.clear();
  }

  getStatusLogin = () => !!localStorage.getItem('login');
}
