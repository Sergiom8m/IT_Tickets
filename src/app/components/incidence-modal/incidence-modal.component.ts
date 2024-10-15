import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

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

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  confirm() {
    const newIncidence = {
      id: '', 
      user_uid: '', 
      title: this.title,
      description: this.description,
      status: 'open',
      createdAt: new Date().toDateString(),
      priority: this.priority,
    };

    this.modalController.dismiss(newIncidence, 'confirm');
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