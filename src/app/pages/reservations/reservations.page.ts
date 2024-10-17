import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Reservation, User, Vehicle } from 'src/app/models';
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
  reservations: any[] = []; // Para almacenar las reservas
  selectedVehicle: Vehicle | null = null; // Para manejar el vehículo seleccionado
  users: User[] = []; // Para almacenar los usuarios
  path_vehicles = "Vehiculos/";
  path_reservations = "Reservas/";

  constructor(
    private alertController: AlertController,
    private firestoreService: FirestoreService
  ) {
    this.selectedDate = new Date().toISOString(); // Inicializa con la fecha actual
    this.formattedDate = this.formatDate(this.selectedDate);
  }

  ngOnInit() {
    this.loadVehicles();
    this.loadReservations();
    this.loadUsers();
  }

  loadVehicles() {
    this.firestoreService.getCollection<Vehicle>(this.path_vehicles).subscribe((vehicles) => {
      this.vehicles = vehicles; // Almacena los vehículos en la variable
    });
  }

  loadReservations() {
    this.firestoreService.getCollection<Reservation>(this.path_reservations).subscribe((reservations) => {
      this.reservations = reservations; // Almacena las reservas en la variable
    });
  }

  loadUsers() {
    this.firestoreService.getCollection<User>('Usuarios').subscribe((users) => {
      this.users = users; // Almacena los usuarios en la variable
    });
  }

  getReservationsForVehicle(vehicleId: string) {
    // Convertimos la fecha seleccionada a un objeto Date
    const selectedDateObj = new Date(this.selectedDate);
    
    // Normalizamos la fecha para que solo contenga el día (sin hora)
    const startOfDay = new Date(selectedDateObj);
    startOfDay.setHours(0, 0, 0, 0); // Establecer a 00:00:00.000
    const endOfDay = new Date(selectedDateObj);
    endOfDay.setHours(23, 59, 59, 999); // Establecer a 23:59:59.999
  
    return this.reservations
      .filter(reservation => reservation.vehicleId === vehicleId) // Filtrar por el vehículo
      .filter(reservation => {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        // Verificar si la fecha seleccionada cae entre el inicio y fin del día de la reserva
        return startDate <= endOfDay && endDate >= startOfDay;
      })
      .map(reservation => {
        const user = this.users.find(user => user.uid === reservation.userId);
        return {
          ...reservation,
          userName: user ? user.name : 'Usuario desconocido'
        };
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

  formatReservationDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Asegúrate de que el mes esté en dos dígitos
    const day = String(date.getDate()).padStart(2, '0'); // Asegúrate de que el día esté en dos dígitos
    const hours = String(date.getHours()).padStart(2, '0'); // Asegúrate de que la hora esté en dos dígitos
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Asegúrate de que los minutos estén en dos dígitos
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}
