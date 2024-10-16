import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
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

  path = "Reservas/";

  user: User = {} as User;
  vehicle: Vehicle  = {} as Vehicle;

  reservation: Reservation = {
    id: '',
    vehicleId: '', // Esto debería ser pasado desde la tarjeta del vehículo
    userId: '', // Debes obtener el ID del usuario actual
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    estimatedKm: 0,
    projectCode: '',
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

  reserveVehicle() {
    // Validar que todos los campos estén completos y que los kilómetros no sean cero
    if (!this.reservation.startDate || !this.reservation.endDate || !this.reservation.estimatedKm || this.reservation.estimatedKm <= 0) {
      this.showToast('Por favor completa todos los campos y asegúrate de que los kilómetros sean mayores que 0.');
      return;
    }

    this.showLoading();

    this.reservation.id = this.firestoreService.getId();
    this.reservation.userId = this.user.uid;
    this.reservation.vehicleId = this.vehicle.licensePlate;

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

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 16); // Devuelve la cadena en formato ISO (YYYY-MM-DDTHH:mm)
  }
  
}
