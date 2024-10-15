import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IncidencesPage } from './incidences.page';

const routes: Routes = [
  {
    path: '',
    component: IncidencesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncidencesPageRoutingModule {}
