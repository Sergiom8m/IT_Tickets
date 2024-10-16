import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Reservation, User, Vehicle } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.page.html',
  styleUrls: ['./reservation.page.scss'],
})
export class ReservationPage implements OnInit {

  path = "Reservas/"

  user: User = {} as User;
  vehicle: Vehicle  = {} as Vehicle;

  reservation: Reservation = {
    id: '',
    vehicleId: '', // Esto debería ser pasado desde la tarjeta del vehículo
    userId: '', // Debes obtener el ID del usuario actual
    startDate: new Date(),
    endDate: new Date(),
    estimatedKm: 0,
    projectCode: '',
  };

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private route: ActivatedRoute
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
  
    // Obtener el vehicleId de los parámetros de consulta
    this.route.queryParams.subscribe(params => {
      const vehicleId = params['id'];
      if (vehicleId) {
        // Ahora que tienes el ID, obtén los datos del vehículo
        this.firestoreService.getDoc<Vehicle>('Vehiculos/', vehicleId).subscribe(vehicleData => {
          this.vehicle = vehicleData as Vehicle;
          console.log(this.vehicle); // Verifica que estás recibiendo el vehículo correcto
        });
      }
    });
  }

  reserveVehicle() {
    this.reservation.id = this.firestoreService.getId(); // Generar un ID único
    this.reservation.userId = this.user.uid; // Asignar el ID del usuario
    console.log(this.reservation)
    this.firestoreService.createDoc(this.reservation, this.path, this.reservation.id)
      .then(() => {
        console.log('Reserva creada con éxito');
      })
      .catch(error => {
        console.error('Error creando la reserva:', error);
      });
  }

  

}
