import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

import { User } from '../models';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {

  segment: 'login' | 'register' = 'login'; 
  uid = ''; 
  path = 'Usuarios/';
  loading: any;

  actualUser: User = {
    uid: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    code: '',
    department: '',
    role: 'user'
  } as User;


  constructor(
    private afAuth: AngularFireAuth, 
    private router: Router,
    public firebaseAuthService: AuthService,
    public firestoreService: FirestoreService,
    private toastController: ToastController,
    public loadingController: LoadingController
  ) {
    // Cuando se inicia la página, se comprueba si el user está logeado (subscribirse para estar al tanto de los cambios)
    this.firebaseAuthService.stateAuth().subscribe( res => {
      if (res !== null) {
        // Si la respuesta no es nula, se obtiene el uid del user
        const uid = res.uid;
      }
      else {
        this.initUser();
      }
    });
  }

  getUserInfo(uid: string) {
    // Obtener el documento del user de Firestore
    this.firestoreService.getDoc<User>(this.path, uid).subscribe( res => {
      if (res) {
        // Si existe el documento, se asigna la información del user a la variable user
        this.actualUser = res;
      }
    });
  }

  initUser() {
    this.actualUser = {
      uid: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      telephone: '',
      code: '',
      department: '',
      role: 'user'
    } as User; // Reinicia completamente el objeto user
  }

  async register() {

    await this.showLoading();

    const isValid = await this.validateUserInput('register');
    if (!isValid) return;

    this.firebaseAuthService.register(this.actualUser.email, this.actualUser.password).then(res => {
      if (res.user) {
        // Obtener el uid del usuario registrado
        const uid = res.user.uid; 

        // Asignar el uid al usuario  
        this.actualUser.uid = uid;

        // Crear un documento en Firestore con el uid del usuario
        this.firestoreService.createDoc(this.actualUser, this.path, uid).then(() => {
          console.log('Usuario registrado correctamente');
          this.initUser(); // Limpiar campos después de registrar
          this.loading.dismiss(); 
        });
      }
    }).catch(error => {
      // Verificar si el error es de "correo ya en uso"
      if (error.code === 'auth/email-already-in-use') {
        this.showToast('El correo electrónico ya está en uso por otra cuenta.');
      } else {
        this.showToast('Error al registrar el usuario.');
      }
      this.loading.dismiss();
    });
  }

  async login() {

    await this.showLoading();

    const isValid = await this.validateUserInput('login');
    if (!isValid) return;

    this.firebaseAuthService.login(this.actualUser.email, this.actualUser.password).then(res => {
      if (res.user) {
        this.initUser(); // Limpiar campos después de iniciar sesión
        this.loading.dismiss();
      }
    }).catch(error => {
      this.loading.dismiss();
    });
  }

  logout() {
    this.firebaseAuthService.logout().then(() => {
      this.initUser(); // Limpiar campos al cerrar sesión
    }).catch(error => {
      console.error('Error al cerrar sesión:', error);
    });
  }

  // Función para realizar todas las validaciones de los formularios
  async validateUserInput(action: 'register' | 'login') {
    if (!this.actualUser.email || !this.actualUser.password || (action === 'register' && !this.actualUser.name) || 
        (action === 'register' && !this.actualUser.telephone) || 
        (action === 'register' && !this.actualUser.code) || 
        (action === 'register' && !this.actualUser.department)) {
      await this.showToast('Todos los campos son obligatorios.');
      return false;
    }

    // Validar el formato del email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar el email
    if (!emailPattern.test(this.actualUser.email)) {
      await this.showToast('Formato de email no válido.');
      return false;
    }

    // Validar que las contraseñas coincidan
    if (action === 'register' && this.actualUser.password !== this.actualUser.confirmPassword) {
      await this.showToast('Las contraseñas no coinciden.');
      return false;
    }

    // Validar la longitud de la contraseña 
    if (this.actualUser.password.length < 6) {
      await this.showToast('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    return true; // Todas las validaciones pasadas
  }

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: 'light'
    });
    toast.present();
  }

  async showLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'normal',
      message: 'Procesando, por favor espere...',
    });
    await this.loading.present();
  }

}
