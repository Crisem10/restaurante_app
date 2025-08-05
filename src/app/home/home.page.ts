import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
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

  constructor(private navCtrl: NavController) {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.navCtrl.navigateRoot('/login');
  }
}
