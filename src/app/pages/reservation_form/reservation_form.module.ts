import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReservationPageRoutingModule } from './reservation_form-routing.module';

import { ReservationFormPage } from './reservation_form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReservationPageRoutingModule
  ],
  declarations: [ReservationFormPage]
})
export class ReservationFormPageModule {}
