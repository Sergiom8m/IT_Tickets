import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IncidencesPageRoutingModule } from './incidences-routing.module';

import { IncidencesPage } from './incidences.page';
import { IncidenceModalModule } from 'src/app/components/incidence-modal/incidence-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IncidencesPageRoutingModule,
    IncidenceModalModule
  ],
  declarations: [IncidencesPage]
})
export class IncidencesPageModule {}
