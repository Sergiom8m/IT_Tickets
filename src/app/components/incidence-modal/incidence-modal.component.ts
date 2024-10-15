import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Incidence } from 'src/app/models';

@Component({
  selector: 'app-incidence-modal',
  templateUrl: './incidence-modal.component.html',
  styleUrls: ['./incidence-modal.component.scss'],
})
export class IncidenceModalComponent implements OnInit {

  @ViewChild(IonModal) modal!: IonModal;
  title: string = '';
  description: string = '';
  priority: number = 1; 

  @Input() incidence: Incidence | null = null; // Añadir propiedad para la incidencia a editar

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
    // Si hay una incidencia, inicializa los campos
    if (this.incidence) {
      this.title = this.incidence.title;
      this.description = this.incidence.description;
      this.priority = this.incidence.priority;
    }
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  confirm() {
    const updatedIncidence = {
      id: this.incidence ? this.incidence.id : '', 
      user_uid: this.incidence ? this.incidence.user_uid : '', 
      title: this.title,
      description: this.description,
      status: this.incidence ? this.incidence.status : 'open',
      createdAt: this.incidence ? this.incidence.createdAt : new Date().toDateString(),
      priority: this.priority,
      resolvedAt: this.incidence ? this.incidence.resolvedAt : null, // Mantener el estado de resuelto si se edita
    };

    this.modalController.dismiss(updatedIncidence, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      // Puedes manejar lo que sucede al confirmar aquí, si es necesario
      console.log('Nueva incidencia:', ev.detail.data);
    }
  }

  getPriorityLabel(): string {
    switch (this.priority) {
      case 1:
        return 'Baja';
      case 2:
        return 'Media';
      case 3:
        return 'Alta';
      default:
        return 'Baja'; // Valor por defecto
    }
  }

}