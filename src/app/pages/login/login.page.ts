import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../../models';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {

  uid = ''; 
  path = 'Usuarios/';
  loading: any;

  actualUser: User = {
    uid: '',
    name: '',
    email: '',
    password: '',
    telephone: '',
    code: '',
    department: '',
    role: 'user'
  } as User;

  constructor(
    private router: Router,
    public firebaseAuthService: AuthService,
    public firestoreService: FirestoreService,
    private toastController: ToastController,
    public loadingController: LoadingController
  ) {
    // Cuando se inicia la página, se comprueba si el user está logeado (subscribirse para estar al tanto de los cambios)
    this.firebaseAuthService.stateAuth().subscribe( res => {
      if (res === null) {
        // Si la respuesta es nula, se obtiene el inicializa el user
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
      telephone: '',
      code: '',
      department: '',
      role: 'user'
    } as User; // Reinicia completamente el objeto user
  }

  async login() {
    await this.showLoading();

    const isValid = await this.validateUserInput();
    if (!isValid) {
      this.loading.dismiss(); // Cerrar loading si falla la validación
      return;
    }

    this.firebaseAuthService.login(this.actualUser.email, this.actualUser.password).then(res => {
      if (res.user) {
        this.initUser(); // Limpiar campos después de iniciar sesión
        this.loading.dismiss(); // Asegurarse de cerrar el loading en éxito
        this.router.navigate(['/home']);
      }
    }).catch(error => {
      this.loading.dismiss(); // Cerrar loading si hay error al iniciar sesión
      console.error('Error al iniciar sesión:', error);
      this.showToast('Error al iniciar sesión.');
    });
  }

  // Función para realizar todas las validaciones de los formularios
  async validateUserInput() {
    if (!this.actualUser.email || !this.actualUser.password) {
      await this.showToast('Todos los campos son obligatorios.');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.actualUser.email)) {
      await this.showToast('Formato de email no válido.');
      return false;
    }

    if (this.actualUser.password.length < 6) {
      await this.showToast('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    return true;
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
