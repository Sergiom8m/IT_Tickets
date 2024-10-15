import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { User } from 'src/app/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  user: User = {} as User;

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private router: Router
  ) { }

  ngOnInit() {
    // Obtener el UID del usuario que ha iniciado sesión
    this.authService.stateAuth().subscribe(res => {
      if (res !== null) {
        const uid = res.uid;
        // Obtener la información del usuario desde Firestore
        this.firestoreService.getDoc<User>('Usuarios/', uid).subscribe(userData => {
          this.user = userData as User;
        });
      }
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']); // Redirige a la página de login después de cerrar sesión
    }).catch(error => {
      console.error('Error al cerrar sesión:', error);
    });
  }

  goToIncidences() {
    this.router.navigate(['/incidencias']);
  }

  goToVehicles() {
    this.router.navigate(['/vehiculos']);
  }
}
