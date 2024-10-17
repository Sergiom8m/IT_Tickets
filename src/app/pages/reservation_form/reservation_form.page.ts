import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Reservation, User, Vehicle } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation_form.page.html',
  styleUrls: ['./reservation_form.page.scss'],
})
export class ReservationFormPage implements OnInit {

  path = "Reservas/";

  user: User = {} as User;
  vehicle: Vehicle  = {} as Vehicle;

  reservation: Reservation = {
    id: '',
    vehicleId: '', // Esto debería ser pasado desde la tarjeta del vehículo
    userId: '', // Debes obtener el ID del usuario actual
    startDate: this.convertToISOWithOffset(new Date()),
    endDate: this.convertToISOWithOffset(new Date()),
    estimatedKm: 0,
    projectCode: '',
    active: true
  };

  private reservationSubscription: Subscription | null = null;
  loading: any;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    console.log(this.reservation.startDate);
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

  async reserveVehicle() {
    
    // Validar que todos los campos estén completos y que los kilómetros no sean cero
    if (!this.reservation.startDate || !this.reservation.endDate || !this.reservation.estimatedKm || this.reservation.estimatedKm <= 0) {
      this.showToast('Por favor completa todos los campos y asegúrate de que los kilómetros sean mayores que 0.');
      return;
    }

    this.showLoading();

    this.reservation.id = this.firestoreService.getId();
    this.reservation.userId = this.user.uid;
    this.reservation.vehicleId = this.vehicle.licensePlate;

    // Verificar solapamientos
    const overlappingReservations = await this.checkOverlappingReservations();

    if (overlappingReservations.length > 0) {
      for (const existingReservation of overlappingReservations) {
        // Comparar el kilometraje
        if (existingReservation.estimatedKm > this.reservation.estimatedKm) {
          this.reservation.active = false; // Si la reserva existente tiene mayor kilometraje, desactivar la nueva
        } else {
          // Si la nueva reserva tiene mayor kilometraje, desactivar la existente
          existingReservation.active = false;
          await this.firestoreService.updateDoc(existingReservation, this.path, existingReservation.id);
        }
      }
    }

    // Crear la nueva reserva
    this.firestoreService.createDoc(this.reservation, this.path, this.reservation.id)
      .then(() => {
        this.router.navigate(['/vehicles']); // Navegación al menú de vehículos
        this.showToast('Reserva creada correctamente');
        this.loading.dismiss();
      })
      .catch(error => {
        console.error('Error creando la reserva:', error);
        this.showToast('Error creando la reserva');
        this.loading.dismiss();
      });
  }

  async checkOverlappingReservations(): Promise<Reservation[]> {
    const startDate = new Date(this.reservation.startDate);
    const endDate = new Date(this.reservation.endDate);
  
    try {
      // Consultar todas las reservas activas para el vehículo usando FirestoreService
      const reservations$ = this.firestoreService.getCollectionQuery<Reservation>(this.path, ref => 
        ref
          .where('vehicleId', '==', this.vehicle.licensePlate)
          .where('active', '==', true)
      );
  
      // Obtener las reservas como una promesa usando firstValueFrom
      const reservations = await firstValueFrom(reservations$);
  
      // Verificar si existen reservas
      if (!reservations || reservations.length === 0) {
        return []; // No hay reservas que se solapen
      }
  
      // Filtrar las reservas que se solapan
      const overlappingReservations = reservations.filter(existingReservation => {
        const existingStartDate = new Date(existingReservation.startDate);
        const existingEndDate = new Date(existingReservation.endDate);
  
        // Comprobar si hay solapamiento de fechas
        return (startDate < existingEndDate && endDate > existingStartDate);
      });
  
      return overlappingReservations;
    } catch (error) {
      console.error('Error al verificar reservas superpuestas:', error);
      return [];
    }
  }

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: 'light'
    });
    toast.present();
  }

  async showLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'normal',
      message: 'Procesando, por favor espere...',
    });
    await this.loading.present();
  }

  getVehicleImage(model: string): string {
    const imageName = model.toLowerCase().replace(/\s+/g, '_'); // Convierte "Dacia Duster" a "dacia_duster"
    return `../../../assets/${imageName}.png`; // Asumiendo que la imagen sigue el patrón [nombre].png
  }

  private convertToISOWithOffset(date: Date): string {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 19); // Remover los milisegundos y los segundos
  }
  
}
