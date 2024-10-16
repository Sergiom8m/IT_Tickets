import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Vehicle } from 'src/app/models';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.scss'],
})
export class VehiclesPage implements OnInit {

  vehicles: any[] = []; 
  path = "Vehiculos/"

  constructor(
    private firestoreService: FirestoreService,
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

}
