import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.page.html',
  styleUrls: ['./reservations.page.scss'],
})
export class ReservationsPage {
  selectedDate: string;
  formattedDate: string;

  constructor(private alertController: AlertController) {
    this.selectedDate = new Date().toISOString(); // Inicializa con la fecha actual
    this.formattedDate = this.formatDate(this.selectedDate);
  }

  formatDate(date: string) {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Date(date).toLocaleDateString('es-ES', options);
  }

  async openDatePicker() {
    const alert = await this.alertController.create({
      header: 'Selecciona una Fecha',
      inputs: [
        {
          name: 'date',
          type: 'date',
          value: this.selectedDate,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancelado');
          },
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (data.date) {
              this.selectedDate = data.date;
              this.formattedDate = this.formatDate(this.selectedDate);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  previousDay() {
    const currentDate = new Date(this.selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    this.selectedDate = currentDate.toISOString();
    this.formattedDate = this.formatDate(this.selectedDate);
  }

  nextDay() {
    const currentDate = new Date(this.selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    this.selectedDate = currentDate.toISOString();
    this.formattedDate = this.formatDate(this.selectedDate);
  }
}
