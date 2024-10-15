import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
      this.getUserUid();
  }

  login(email: string, password: string) {
    // Logear el user en el servicio de Firebase Auth
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  register(email: string, password: string) {
    // Registrar el user en el servicio de Firebase Auth
    return this.afAuth.createUserWithEmailAndPassword(email, password)
  }

  logout() {
    // Deslogear el user en el servicio de Firebase Auth
    return this.afAuth.signOut();
  }

  async getUserUid() {
    // Obtener el uid del user actual
    const user = await this.afAuth.currentUser;
    if (user === null) {
      return null;
    } 
    else {
      return user.uid;
    }
  }

  stateAuth() {
    // Obtener el estado de autenticación del user
    return this.afAuth.authState;
  }

}
