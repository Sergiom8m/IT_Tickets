import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IncidenceModalComponent } from 'src/app/components/incidence-modal/incidence-modal.component';
import { Incidence, User } from 'src/app/models';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-incidences',
  templateUrl: './incidences.page.html',
  styleUrls: ['./incidences.page.scss'],
})
export class IncidencesPage implements OnInit {

  incidences: any[] = [];
  path: string = '/Incidencias';

  constructor(
    private modalController: ModalController,
    private firestoreService: FirestoreService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.loadIncidences();
  }

  async loadIncidences() {
    // Obtener el usuario actual y su rol
    this.authService.getUserUid().then(user_uid => {
      if (user_uid) {
        const uid = user_uid;
  
        // Obtener el rol del usuario de Firestore
        this.firestoreService.getDoc<User>('Usuarios/', uid).subscribe(user_doc => {
          if (user_doc) {
            const user_role = user_doc.role;
  
            // Cargar todas las incidencias desde Firestore
            this.firestoreService.getCollection<Incidence>(this.path).subscribe(data => {
              // Filtrar las incidencias según el rol del usuario
              if (user_role === 'admin') {
                // Si es admin, cargar todas las incidencias que no están resueltas
                this.incidences = data.filter(incidence => incidence.status !== 'resolved');
              } else {
                // Si es un usuario normal, cargar solo sus incidencias que no están resueltas
                this.incidences = data.filter(incidence => 
                  incidence.user_uid === uid && 
                  incidence.status !== 'resolved'
                );
              }
            });
          } else {
            console.error('User document is undefined');
          }
        });
  
      } else {
        // Manejar el caso donde no hay usuario (no autenticado)
        this.incidences = []; // O cualquier lógica que desees implementar
      }
    });
  }

  async openAddIncidenceModal() {
    const modal = await this.modalController.create({
      component: IncidenceModalComponent,
    });
  
    modal.onDidDismiss().then((newIncidence) => {
      if (newIncidence.data) {
        // Obtener el uid del usuario que ha iniciado sesión
        this.authService.getUserUid().then(res => {
          if (res !== null) {
            const uid = res;
            // Añadir a la incidencia el uid del usuario
            newIncidence.data.user_uid = uid;
            // Atribuirle un id de Firestore a la incidencia
            newIncidence.data.id = this.firestoreService.getId();
  
            this.firestoreService.createDoc(newIncidence.data, this.path, newIncidence.data.id)
              .then(() => {
                console.log('Incidencia añadida correctamente');
              })
              .catch((error) => {
                console.error('Error al añadir la incidencia:', error);
              });
          }
        });
      }
    });
  
    return await modal.present();
  }

}
