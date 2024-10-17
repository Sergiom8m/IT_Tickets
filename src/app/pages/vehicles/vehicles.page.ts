import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Vehicle } from 'src/app/models';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.scss'],
})
export class VehiclesPage implements OnInit {

  vehicles: any[] = []; 
  path = "Vehiculos/";

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.firestoreService.getCollection<Vehicle>(this.path).subscribe(vehicles => {
      this.vehicles = vehicles;
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
    const alert = await this.alertController.create({
      header: 'Información del vehículo: ' + vehicle.licensePlate,
      inputs: [
        {
          name: 'info',
          type: 'textarea',
          value: vehicle.info, // Mostrar el valor actual de la info del vehículo
          placeholder: 'Introduzca la información del vehículo'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Edición cancelada');
            return true; // Retorna true para cerrar el alert
          }
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.info && data.info.trim().length > 0) {
              vehicle.info = data.info.trim(); // Asignar el nuevo valor a la propiedad 'info'
              this.saveVehicleInfo(vehicle); // Guardar los cambios en Firestore
              return true; // Devuelve true para cerrar el alert tras el guardado
            } else {
              this.showToast('El campo de información no puede estar vacío');
              return false; // Impedir que el alert se cierre si la validación falla
            }
          }
        }
      ]
    });
  
    await alert.present();
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
