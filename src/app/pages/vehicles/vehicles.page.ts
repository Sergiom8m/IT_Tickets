import { Component, OnInit } from '@angular/core';
import { Vehicle } from 'src/app/models';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.scss'],
})
export class VehiclesPage implements OnInit {

  vehicles: Vehicle[] = [
    {
      model: 'Toyota Prius',
      licensePlate: '0021-FSB',
      isFourByFour: false,
      needsFuel: false,
      needsRepair: true
    },
    {
      model: 'Land Rover',
      licensePlate: '1534-LYS',
      isFourByFour: true,
      needsFuel: true,
      needsRepair: false
    },
    {
      model: 'Ford Explorer',
      licensePlate: '4298-LNN',
      isFourByFour: false,
      needsFuel: false,
      needsRepair: false
    },
    {
      model: 'Jeep Wrangler',
      licensePlate: '8822-MLJ',
      isFourByFour: true,
      needsFuel: false,
      needsRepair: true
    },
  ];

  constructor() { }

  ngOnInit() {
  }

}
