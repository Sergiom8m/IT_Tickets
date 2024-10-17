import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReservationFormPage } from './reservation_form.page';

const routes: Routes = [
  {
    path: '',
    component: ReservationFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReservationPageRoutingModule {}
