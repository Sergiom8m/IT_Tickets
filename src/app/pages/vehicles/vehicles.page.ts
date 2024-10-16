import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
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

  goToReservation(vehicleId: string) {
    this.router.navigate(['/reservation'], { queryParams: { vehicle_id: vehicleId } });
  }

  async editVehicle(vehicle: Vehicle) {
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

            this.saveChanges(vehicle, needsRepair, needsFuel);
          }
        }
      ]
    });

    await alert.present();
  }

  saveChanges(vehicle: Vehicle, needsRepair: boolean, needsFuel: boolean) {

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

  getVehicleImage(model: string): string {
    // Extraer la parte del modelo que se usará para identificar la imagen
    const imageName = model.toLowerCase().replace(/\s+/g, '_'); // Convierte "Dacia Duster" a "dacia_duster"
    return `../../../assets/${imageName}.png`; // Asumiendo que la imagen sigue el patrón [nombre].png
  }

}
