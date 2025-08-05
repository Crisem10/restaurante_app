
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgClass } from '@angular/common';
import { MainTabBarComponent } from '../../components/main-tab-bar.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NgClass, TitleCasePipe, DatePipe, MainTabBarComponent, FormsModule]
})
export class PerfilPage implements OnInit {
  editando = false;
  usuario: any = {
    nombre: '',
    correo: '',
    rol: ''
  };
  pagos: any[] = [];
  loadingPagos = true;

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.api.getUsuario().subscribe(
      data => {
        this.usuario = data;
      },
      err => {
        this.usuario = {
          nombre: '',
          correo: '',
          rol: ''
        };
      }
    );
  }

  verPagos() {
    this.router.navigate(['/mis-pagos']);
  }

  editarPerfil() {
    this.editando = true;
    this.usuario.contrasena = '';
  }

  guardarEdicion() {
    const token = localStorage.getItem('token');
    const datos = { ...this.usuario };
    if (!datos.contrasena) {
      delete datos.contrasena;
    }
    (this.api as any).http.put(`http://localhost:3000/usuarios/${this.usuario.id}`, datos, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data: any) => {
        this.usuario = data;
        this.editando = false;
        alert('Datos actualizados correctamente');
      },
      error: (err: any) => {
        alert('Error al actualizar los datos');
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
