import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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

  private reservationSubscription: Subscription | null = null;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private route: ActivatedRoute,
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
  
    // Obtener el vehicleId de los parámetros de consulta
    this.route.queryParams.subscribe(params => {
      const vehicleId = params['vehicle_id'];
      if (vehicleId) {
        // Ahora que tienes el ID, obtén los datos del vehículo
        this.firestoreService.getDoc<Vehicle>('Vehiculos/', vehicleId).subscribe(vehicleData => {
          this.vehicle = vehicleData as Vehicle;
        });
      }
    });
  }

  ngOnDestroy() {
    // Desuscribirse para evitar fugas de memoria
    if (this.reservationSubscription) {
      this.reservationSubscription.unsubscribe();
    }
  }

  reserveVehicle() {
    this.reservation.id = this.firestoreService.getId();
    this.reservation.userId = this.user.uid;
    this.reservation.vehicleId = this.vehicle.licensePlate;

    // Verificar si hay reservas que coinciden con el mismo vehículo
    this.reservationSubscription = this.firestoreService.getCollection<Reservation>(this.path).subscribe(reservations => {
      const conflictingReservations = reservations.filter(reservation =>
        reservation.vehicleId === this.reservation.vehicleId &&
        this.datesOverlap(new Date(reservation.startDate), new Date(reservation.endDate),
          new Date(this.reservation.startDate), new Date(this.reservation.endDate))
      );

      if (conflictingReservations.length > 0) {
        const maxKmReservation = conflictingReservations.reduce((prev, current) => {
          return (prev.estimatedKm > current.estimatedKm) ? prev : current;
        });

        conflictingReservations.forEach(conflict => {
          if (conflict.id !== maxKmReservation.id) {
            this.firestoreService.deleteDoc(this.path, conflict.id);
          }
        });
      }

      // Crear la nueva reserva
      this.firestoreService.createDoc(this.reservation, this.path, this.reservation.id)
        .then(() => {
          console.log('Reserva creada con éxito');
          this.router.navigate(['/vehicles']); // Navegación al menú de vehículos
        })
        .catch(error => {
          console.error('Error creando la reserva:', error);
        });
    });
  }

  private datesOverlap(startDate1: Date, endDate1: Date, startDate2: Date, endDate2: Date): boolean {
    return startDate1 < endDate2 && startDate2 < endDate1;
  }
}
