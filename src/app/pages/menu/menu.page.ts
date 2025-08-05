import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss']
})
export class MenuPage implements OnInit {
  menuItems: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadMenu();
  }

  loadMenu() {
    this.loading = true;
    this.apiService.obtenerMenu().subscribe({
      next: (data: any) => {
        this.menuItems = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el menú.';
        this.loading = false;
      }
    });
  }
}
