import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
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
  user: User = {} as User;
  currentSegment: string = 'active';

  constructor(
    private modalController: ModalController,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Obtener el UID del usuario que ha iniciado sesión
    this.authService.stateAuth().subscribe(res => {
      if (res !== null) {
        const uid = res.uid;
        // Obtener la información del usuario desde Firestore
        this.firestoreService.getDoc<User>('Usuarios/', uid).subscribe(userData => {
          this.user = userData as User;
          // Llamar a loadIncidences después de haber obtenido el rol del usuario
          this.loadIncidences();
        });
      }
    });
  }
  
  async loadIncidences() {
    // Obtener todas las incidencias sin filtrar
    this.firestoreService.getCollection<Incidence>(this.path).subscribe(incidences => {
      // Almacenar todas las incidencias, tanto activas como resueltas
      this.incidences = incidences.filter(incidence => 
        this.user.role === 'admin' || incidence.user_uid === this.user.uid
      );
  
      // Obtener nombre y correo electrónico del usuario para cada incidencia
      this.incidences.forEach(incidence => {
        this.firestoreService.getDoc<User>('Usuarios/', incidence.user_uid).subscribe(user => {
          if (user) {
            incidence.user_name = user.name; 
            incidence.user_email = user.email; 
            incidence.createdAt = incidence.createdAt; 
          }
        });
      });
    });
  }

  filteredIncidences() {
    if (this.user.role === 'admin') {
      // Los administradores pueden filtrar entre activas y pasadas
      if (this.currentSegment === 'active') {
        return this.incidences.filter(incidence => incidence.status === 'open');
      } else {
        return this.incidences.filter(incidence => incidence.status === 'resolved');
      }
    } else {
      // Los usuarios normales solo ven sus incidencias activas
      return this.incidences.filter(incidence => incidence.status === 'open' && incidence.user_uid === this.user.uid);
    }
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

  editIncidence(incidence: Incidence) {
    // Lógica para editar la incidencia
    console.log('Editando incidencia:', incidence);
    // Aquí podrías abrir un modal similar al de añadir incidencia
  }
  
  async deleteIncidence(incidence: Incidence) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta incidencia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            // Lógica para borrar la incidencia
            this.firestoreService.deleteDoc(this.path, incidence.id)
              .then(() => {
                console.log('Incidencia eliminada:', incidence);
              })
              .catch(error => {
                console.error('Error al eliminar la incidencia:', error);
              });
          }
        }
      ]
    });

    await alert.present();
  }

  
  markAsCompleted(incidence: Incidence) {
    const newStatus = incidence.status === 'resolved' ? 'open' : 'resolved';
    const updates: { status: string; resolvedAt?: Date | null } = { status: newStatus };
  
    // Si estamos marcando la incidencia como 'resolved', establecer 'resolvedAt' a la fecha actual
    if (newStatus === 'resolved') {
      updates.resolvedAt = new Date();
    } else {
      updates.resolvedAt = null; // Establecer 'resolvedAt' en null al marcar como 'open'
    }
  
    this.firestoreService.updateDoc(
      updates, 
      this.path, 
      incidence.id
    ).then(() => {
      // Actualizar el estado localmente sin necesidad de volver a cargar las incidencias
      incidence.status = newStatus;
      incidence.resolvedAt = updates.resolvedAt ?? undefined; // Será undefined si se establece como open
      console.log('Estado de incidencia actualizado:', incidence);
    }).catch(error => {
      console.error('Error al actualizar la incidencia:', error);
    });
  }
}