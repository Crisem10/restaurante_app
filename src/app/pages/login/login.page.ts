import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AlertController, NavController, AnimationController } from '@ionic/angular';
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
    private navCtrl: NavController,
    private animationCtrl: AnimationController
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
        
        // Crear animación de éxito
        const successAnimation = this.animationCtrl
          .create()
          .addElement(document.querySelector('.login-form') as HTMLElement)
          .duration(600)
          .easing('ease-out')
          .fromTo('transform', 'scale(1)', 'scale(1.05)')
          .fromTo('opacity', '1', '0.8');

        await successAnimation.play();
        
        // Redirigir a página principal con animación
        this.navCtrl.navigateRoot('/home', {
          animationDirection: 'forward',
          animated: true
        });
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
