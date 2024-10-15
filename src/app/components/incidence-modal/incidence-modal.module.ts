import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IncidenceModalComponent } from './incidence-modal.component'; // Ajusta la ruta según tu estructura de carpetas
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [IncidenceModalComponent],
  imports: [
    CommonModule,
    IonicModule, // Asegúrate de que el módulo de Ionic está importado aquí
    FormsModule
  ],
  exports: [IncidenceModalComponent] // Exporta el componente si lo necesitas en otros módulos
})
export class IncidenceModalModule {}
