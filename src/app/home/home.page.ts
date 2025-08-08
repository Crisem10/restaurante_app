import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavController, AnimationController } from '@ionic/angular';
import { IonContent, IonButton, IonIcon, IonCard, IonCardContent, IonTabBar, IonTabButton } from '@ionic/angular/standalone';
import { MainTabBarComponent } from '../components/main-tab-bar.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    RouterModule,
    IonContent, IonButton, IonIcon, IonCard, IonCardContent,
    IonTabBar, IonTabButton,
    MainTabBarComponent
  ],
})
export class HomePage {
  isLoggedIn = false;

  constructor(
    private navCtrl: NavController,
    private animationCtrl: AnimationController
  ) {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  // Navegar con animación a promociones
  async goToPromociones() {
    const buttonElement = document.querySelector('#promociones-btn') as HTMLElement;
    if (buttonElement) {
      const animation = this.animationCtrl
        .create()
        .addElement(buttonElement)
        .duration(300)
        .easing('ease-out')
        .fromTo('transform', 'scale(1)', 'scale(0.95)')
        .fromTo('opacity', '1', '0.8');

      await animation.play();
    }
    
    this.navCtrl.navigateForward('/promociones', {
      animated: true,
      animationDirection: 'forward'
    });
  }

  // Navegar con animación al menú
  async goToMenu() {
    const buttonElement = document.querySelector('#menu-btn') as HTMLElement;
    if (buttonElement) {
      const animation = this.animationCtrl
        .create()
        .addElement(buttonElement)
        .duration(300)
        .easing('ease-out')
        .fromTo('transform', 'scale(1)', 'scale(0.95)')
        .fromTo('opacity', '1', '0.8');

      await animation.play();
    }
    
    this.navCtrl.navigateForward('/menu', {
      animated: true,
      animationDirection: 'forward'
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.navCtrl.navigateRoot('/login');
  }
}
