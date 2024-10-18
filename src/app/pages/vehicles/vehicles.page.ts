import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { User, Vehicle } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.scss'],
})
export class VehiclesPage implements OnInit {

  vehicles: Vehicle[] = []; 
  path = "Vehiculos/";
  user: User = {} as User;


  isAdmin = false;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadVehicles();
    this.authService.stateAuth().subscribe(res => {
      if (res !== null) {
        const uid = res.uid;
        // Obtener la información del usuario desde Firestore
        this.firestoreService.getDoc<User>('Usuarios/', uid).subscribe(userData => {
          this.user = userData as User;
          this.isAdmin = this.user.role === 'admin';
        });
      }
    });
  }

  async loadVehicles() {
    this.firestoreService.getCollection<Vehicle>(this.path).subscribe(vehicles => {
      this.vehicles = vehicles;
    console.log('Vehículos cargados:', this.vehicles);
    });
  }

  goToReservationForm(vehicleId: string) {
    this.router.navigate(['/reservation_form'], { queryParams: { vehicle_id: vehicleId } });
  }

  async editVehicleStatus(vehicle: Vehicle) {
    const alert = await this.alertController.create({
      header: 'Editar Vehículo',
      inputs: [
        {
          name: 'needsRepair',
          type: 'checkbox',
          label: 'Averia',
          value: 'needsRepair', 
          checked: vehicle.needsRepair 
        },
        {
          name: 'needsFuel',
          type: 'checkbox',
          label: 'Combustible bajo',
          value: 'needsFuel', 
          checked: vehicle.needsFuel 
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancelado');
          }
        },
        {
          text: 'Guardar',
          handler: (data) => {
            const needsRepair = data.includes('needsRepair');
            const needsFuel = data.includes('needsFuel');

            this.saveNewState(vehicle, needsRepair, needsFuel);
          }
        }
      ]
    });

    await alert.present();
  }

  async editVehicleInfo(vehicle: Vehicle) {
    console.log('Editando información del vehículo:', vehicle);
    
    const alert = await this.alertController.create({
        header: 'Información del vehículo: ' + vehicle.licensePlate,
        cssClass: 'custom-alert',
        inputs: [
            {
                name: 'info',
                type: 'textarea',
                value: vehicle.info,
                placeholder: 'Introduzca la información del vehículo'
            },
            {
                name: 'itvDate',
                type: 'date',
                value: vehicle.itv,
                placeholder: 'Seleccione la fecha de la ITV',
                attributes: {
                    disabled: !this.isAdmin 
                }
            }
        ],
        buttons: [
            {
                text: 'Cancelar',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                    console.log('Edición cancelada');
                    return true;
                }
            },
            {
                text: 'Guardar',
                handler: (data) => {
                  vehicle.info = data.info.trim();
                  // Solo actualizar la fecha de ITV si es administrador
                  if (this.isAdmin) {
                      vehicle.itv = data.itvDate;
                  }
                  this.saveVehicleInfo(vehicle);
                  return true;
                    
                }
            }
        ]
    });

    await alert.present();
}

  isITVDueSoon(itvDate: string): boolean {
    const today = new Date();
    const itv = new Date(itvDate);
    const diffInTime = itv.getTime() - today.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24); // Convertir diferencia a días
    const res = diffInDays <= 30; // Devuelve true si queda menos de un mes
    console.log('ITV:', itvDate, 'Días restantes:', diffInDays, '¿Próxima ITV?', res);
    return res;
  }

  saveNewState(vehicle: Vehicle, needsRepair: boolean, needsFuel: boolean) {

    vehicle.needsRepair = needsRepair;
    vehicle.needsFuel = needsFuel;

    this.firestoreService.updateDoc(vehicle, this.path, vehicle.licensePlate)
      .then(() => {
        console.log('Vehículo actualizado');
      })
      .catch(error => {
        console.error('Error al actualizar vehículo:', error);
      });
  }

  saveVehicleInfo(vehicle: Vehicle) {
    this.firestoreService.updateDoc(vehicle, this.path, vehicle.licensePlate)
      .then(() => {
        console.log('Información del vehículo actualizada');
      })
      .catch(error => {
        console.error('Error al actualizar información del vehículo:', error);
      });
  }
  
  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: 'light'
    });
    toast.present();
  }

  getVehicleImage(model: string): string {
    // Extraer la parte del modelo que se usará para identificar la imagen
    const imageName = model.toLowerCase().replace(/\s+/g, '_'); // Convierte "Dacia Duster" a "dacia_duster"
    return `../../../assets/${imageName}.png`; // Asumiendo que la imagen sigue el patrón [nombre].png
  }

}
