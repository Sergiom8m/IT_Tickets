import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Vehicle } from 'src/app/models';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.page.html',
  styleUrls: ['./reservations.page.scss'],
})
export class ReservationsPage {
  selectedDate: string;
  formattedDate: string;
  vehicles: any[] = []; // Para almacenar los vehículos
  selectedVehicle: Vehicle | null = null; // Para manejar el vehículo seleccionado
  path_vehicles = "Vehiculos/";

  constructor(
    private alertController: AlertController,
    private firestoreService: FirestoreService
  ) {
    this.selectedDate = new Date().toISOString(); // Inicializa con la fecha actual
    this.formattedDate = this.formatDate(this.selectedDate);
  }

  ngOnInit() {
    this.loadVehicles(); // Carga los vehículos al inicializar
    console.log(this.vehicles);
  }

  loadVehicles() {
    this.firestoreService.getCollection<Vehicle>(this.path_vehicles).subscribe((vehicles) => {
      this.vehicles = vehicles; // Almacena los vehículos en la variable
    });
  }

  toggleVehicle(vehicle: Vehicle) {
    this.selectedVehicle = this.selectedVehicle === vehicle ? null : vehicle; // Alternar entre mostrar y ocultar detalles
  }

  formatDate(date: string) {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Date(date).toLocaleDateString('es-ES', options);
  }

  async openDatePicker() {
    const alert = await this.alertController.create({
      header: 'Selecciona una Fecha',
      inputs: [
        {
          name: 'date',
          type: 'date',
          value: this.selectedDate,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          },
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data.date) {
              this.selectedDate = data.date;
              this.formattedDate = this.formatDate(this.selectedDate);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  previousDay() {
    const currentDate = new Date(this.selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    this.selectedDate = currentDate.toISOString();
    this.formattedDate = this.formatDate(this.selectedDate);
  }

  nextDay() {
    const currentDate = new Date(this.selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    this.selectedDate = currentDate.toISOString();
    this.formattedDate = this.formatDate(this.selectedDate);
  }

  getVehicleImage(model: string): string {
    const imageName = model.toLowerCase().replace(/\s+/g, '_'); // Convierte "Dacia Duster" a "dacia_duster"
    return `../../../assets/${imageName}.png`; // Asumiendo que la imagen sigue el patrón [nombre].png
  }
}
