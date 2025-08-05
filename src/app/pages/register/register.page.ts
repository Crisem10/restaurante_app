import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AlertController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  usuario = {
    nombre: '',
    correo: '',
    contrasena: ''
  };

  constructor(
    private api: ApiService,
    private alertController: AlertController
  ) {}

  async registrar() {
    // Validación básica en frontend
    if (!this.usuario.nombre || !this.usuario.correo || !this.usuario.contrasena) {
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
    if (!emailRegex.test(this.usuario.correo)) {
      const alert = await this.alertController.create({
        header: 'Correo inválido',
        message: 'Por favor ingresa un correo válido.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    this.api.registrarUsuario(this.usuario).subscribe({
      next: async (res) => {
        const alert = await this.alertController.create({
          header: 'Registro Exitoso',
          message: 'Ahora puedes iniciar sesión',
          buttons: ['OK']
        });
        await alert.present();
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: err.error?.error || 'No se pudo registrar',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
