import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainTabBarComponent } from '../../components/main-tab-bar.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, MainTabBarComponent],
  templateUrl: './mis-reservas.page.html',
  styleUrls: ['./mis-reservas.page.scss']
})
export class MisReservasPage implements OnInit {
  reservas: any[] = [];
  loading = false;
  errorMessage = '';

  usuarioId: number | null = null;
  usuarioRol: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    this.loading = true;
    
    // Primero obtenemos los datos del usuario autenticado
    this.apiService.getUsuario().subscribe({
      next: (usuario) => {
        this.usuarioId = usuario.id;
        this.usuarioRol = usuario.rol;
        
        // Ahora cargamos las reservas según el rol
        if (this.usuarioRol === 'admin') {
          this.apiService.obtenerTodasReservas().subscribe({
            next: (data: any) => {
              this.reservas = data;
              this.loading = false;
            },
            error: (err) => {
              this.errorMessage = 'Error al cargar las reservas.';
              this.loading = false;
            }
          });
        } else {
          // Si es cliente, solo sus reservas
          this.apiService.obtenerReservasUsuario(this.usuarioId!).subscribe({
            next: (data: any) => {
              this.reservas = data;
              this.loading = false;
            },
            error: (err) => {
              this.errorMessage = 'Error al cargar tus reservas.';
              this.loading = false;
            }
          });
        }
      },
      error: (err) => {
        this.errorMessage = 'Error al obtener datos del usuario.';
        this.loading = false;
      }
    });
  }

  cancelarReserva(id: number) {
    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return;
    this.apiService.cancelarReserva(id).subscribe({
      next: () => {
        this.cargarReservas();
      },
      error: () => {
        alert('No se pudo cancelar la reserva');
      }
    });
  }
}
