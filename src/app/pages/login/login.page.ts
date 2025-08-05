import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AlertController, NavController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  credenciales = {
    correo: '',
    contrasena: ''
  };

  constructor(
    private api: ApiService,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {}

  async login() {
    // Validación básica en frontend
    if (!this.credenciales.correo || !this.credenciales.contrasena) {
      const alert = await this.alertController.create({
        header: 'Campos requeridos',
        message: 'Por favor completa todos los campos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    // Validación de formato de correo
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(this.credenciales.correo)) {
      const alert = await this.alertController.create({
        header: 'Correo inválido',
        message: 'Por favor ingresa un correo válido.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    this.api.iniciarSesion(this.credenciales).subscribe({
      next: async (res) => {
        // Guardar token en localStorage
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        // Redirigir a página principal directamente
        this.navCtrl.navigateRoot('/home');
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: err.error?.error || 'Correo o contraseña incorrectos',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
