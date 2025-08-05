import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Métodos de autenticación
  registrarUsuario(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/usuarios`, data);
  }

  iniciarSesion(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/usuarios/login`, data);
  }

  // Métodos de usuario
  getUsuario(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/usuarios/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Métodos de menú
  obtenerMenu(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/menus`);
  }

  // Métodos de mesas
  obtenerMesas(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/mesas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  obtenerMesasDisponibles(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/mesas/disponibles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Métodos de reservas
  crearReserva(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/api/reservas`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  obtenerReservasUsuario(usuarioId: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/reservas/usuario/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  obtenerTodasReservas(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/reservas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  cancelarReserva(reservaId: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.baseUrl}/api/reservas/cancelar/${reservaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Métodos de pagos
  crearPagoPayphone(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/api/pagos/payphone/crear`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  verificarEstadoPago(transactionId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/pagos/payphone/verificar/${transactionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  confirmarPago(transactionId: string, confirmacion: boolean): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/api/pagos/payphone/confirmar/${transactionId}`, 
      { confirmacion }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  obtenerMisPagos(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/pagos/mis`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  pagarReserva(data: any) {
    // Método legacy para compatibilidad
    return this.crearPagoPayphone(data);
  }
}
