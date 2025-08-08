import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';
  private useMockData = true; // Activar datos mock mientras se resuelve conectividad

  constructor(private http: HttpClient) {}

  // Datos mock para funcionalidad offline
  private mockMesas = [
    { id: 1, numero: '1', capacidad: 8, estado: 'disponible' },
    { id: 2, numero: '2', capacidad: 4, estado: 'disponible' },
    { id: 3, numero: '3', capacidad: 4, estado: 'disponible' },
    { id: 4, numero: '4', capacidad: 4, estado: 'disponible' },
    { id: 5, numero: '5', capacidad: 4, estado: 'disponible' },
    { id: 6, numero: '6', capacidad: 6, estado: 'disponible' },
    { id: 7, numero: '7', capacidad: 4, estado: 'disponible' },
    { id: 8, numero: '8', capacidad: 4, estado: 'disponible' },
    { id: 9, numero: '9', capacidad: 2, estado: 'disponible' },
    { id: 10, numero: '10', capacidad: 2, estado: 'disponible' },
    { id: 11, numero: '11', capacidad: 6, estado: 'disponible' },
    { id: 12, numero: '12', capacidad: 8, estado: 'disponible' },
    { id: 13, numero: '13', capacidad: 4, estado: 'disponible' },
    { id: 14, numero: '14', capacidad: 4, estado: 'disponible' },
    { id: 15, numero: '15', capacidad: 2, estado: 'disponible' },
    { id: 16, numero: '16', capacidad: 2, estado: 'disponible' },
    { id: 17, numero: '17', capacidad: 6, estado: 'disponible' },
    { id: 18, numero: '18', capacidad: 4, estado: 'disponible' },
    { id: 19, numero: '19', capacidad: 4, estado: 'disponible' },
    { id: 20, numero: '20', capacidad: 8, estado: 'disponible' },
    { id: 21, numero: '21', capacidad: 4, estado: 'disponible' },
    { id: 22, numero: '22', capacidad: 4, estado: 'disponible' }
  ];

  private mockMenu: any[] = [
    {
      id: 1,
      nombre: 'Desayuno Continental',
      descripcion: 'Croissants frescos, mermeladas artesanales, café de grano y frutas de temporada',
      precio: 15.99,
      categoria: 'Desayunos',
      imagen: 'assets/menu/desayuno-continental.svg',
      disponible: true,
      tiempo_preparacion: 15
    },
    {
      id: 2,
      nombre: 'Hamburguesa Gourmet',
      descripcion: 'Carne Angus, queso manchego, tomate, lechuga y papas rústicas',
      precio: 18.50,
      categoria: 'Principales',
      imagen: 'assets/menu/hamburguesa-gourmet.svg',
      disponible: true,
      tiempo_preparacion: 25
    },
    {
      id: 3,
      nombre: 'Pasta Carbonara',
      descripcion: 'Pasta fresca con panceta, huevo, parmesano y pimienta negra',
      precio: 16.99,
      categoria: 'Principales',
      imagen: 'assets/menu/pasta-carbonara.svg',
      disponible: true,
      tiempo_preparacion: 20
    },
    {
      id: 4,
      nombre: 'Ensalada César',
      descripcion: 'Lechuga romana, pollo a la parrilla, crutones, parmesano y aderezo César',
      precio: 14.50,
      categoria: 'Ensaladas',
      imagen: 'assets/menu/ensalada-cesar.svg',
      disponible: true,
      tiempo_preparacion: 10
    },
    {
      id: 5,
      nombre: 'Tiramisu Casero',
      descripcion: 'Postre tradicional italiano con café, mascarpone y cacao',
      precio: 8.99,
      categoria: 'Postres',
      imagen: 'assets/menu/tiramisu.svg',
      disponible: true,
      tiempo_preparacion: 5
    },
    {
      id: 6,
      nombre: 'Salmón a la Plancha',
      descripcion: 'Filete de salmón con vegetales salteados y salsa de limón',
      precio: 24.99,
      categoria: 'Principales',
      imagen: 'assets/menu/salmon-plancha.svg',
      disponible: true,
      tiempo_preparacion: 30
    },
    {
      id: 7,
      nombre: 'Café Americano',
      descripcion: 'Café de grano tostado medio, servido caliente',
      precio: 3.50,
      categoria: 'Bebidas',
      imagen: 'assets/menu/cafe-americano.svg',
      disponible: true,
      tiempo_preparacion: 5
    },
    {
      id: 8,
      nombre: 'Jugo Natural Naranja',
      descripcion: 'Jugo de naranja natural recién exprimido',
      precio: 4.99,
      categoria: 'Bebidas',
      imagen: 'assets/menu/jugo-naranja.svg',
      disponible: true,
      tiempo_preparacion: 3
    }
  ];

  private mockUser = {
    id: 1,
    nombre: 'Usuario Demo',
    email: 'demo@restaurante.com',
    telefono: '123-456-7890'
  };

  // Métodos de autenticación
  registrarUsuario(data: any): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Registro simulado');
      return of({ 
        success: true, 
        message: 'Usuario registrado exitosamente',
        token: 'mock-token-123',
        usuario: { ...this.mockUser, ...data }
      }).pipe(delay(1000));
    }
    return this.http.post(`${this.baseUrl}/api/usuarios`, data).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.registrarUsuario(data);
      })
    );
  }

  iniciarSesion(data: any): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Login simulado');
      return of({ 
        success: true, 
        message: 'Inicio de sesión exitoso',
        token: 'mock-token-123',
        usuario: this.mockUser
      }).pipe(delay(1000));
    }
    return this.http.post(`${this.baseUrl}/api/usuarios/login`, data).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.iniciarSesion(data);
      })
    );
  }

  // Métodos de usuario
  getUsuario(): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Usuario simulado');
      return of(this.mockUser).pipe(delay(500));
    }
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/usuarios/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.getUsuario();
      })
    );
  }

  // Métodos de menú
  obtenerMenu(): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Menú simulado');
      return of(this.mockMenu).pipe(delay(500));
    }
    return this.http.get(`${this.baseUrl}/api/menus`).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.obtenerMenu();
      })
    );
  }

  // Métodos de mesas
  obtenerMesas(): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Mesas simuladas');
      return of(this.mockMesas).pipe(delay(500));
    }
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/mesas`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.obtenerMesas();
      })
    );
  }

  obtenerMesasDisponibles(): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Mesas disponibles simuladas');
      return of(this.mockMesas).pipe(delay(500));
    }
    
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/mesas/disponibles`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.obtenerMesasDisponibles();
      })
    );
  }

  // Métodos de reservas
  crearReserva(data: any): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Reserva simulada', data);
      const mockReserva = {
        id: Math.floor(Math.random() * 1000),
        ...data,
        fecha_creacion: new Date().toISOString(),
        estado: 'confirmada'
      };
      return of({ 
        success: true, 
        message: 'Reserva creada exitosamente',
        reserva: mockReserva
      }).pipe(delay(1000));
    }
    
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/api/reservas`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.crearReserva(data);
      })
    );
  }

  obtenerReservasUsuario(usuarioId: number): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Sin reservas simuladas');
      const mockReservas: any[] = [];
      return of(mockReservas).pipe(delay(500));
    }
    
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/reservas/usuario/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.obtenerReservasUsuario(usuarioId);
      })
    );
  }

  obtenerTodasReservas(): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Todas las reservas simuladas');
      return of([]).pipe(delay(500));
    }
    
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/reservas`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.obtenerTodasReservas();
      })
    );
  }

  cancelarReserva(reservaId: number): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Cancelación de reserva simulada');
      return of({ 
        success: true, 
        message: 'Reserva cancelada exitosamente' 
      }).pipe(delay(500));
    }
    
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.baseUrl}/api/reservas/cancelar/${reservaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.cancelarReserva(reservaId);
      })
    );
  }

  // Métodos de pagos
  crearPagoPayphone(data: any): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Pago Payphone simulado');
      return of({ 
        success: true, 
        transactionId: 'mock-txn-' + Date.now(),
        paymentUrl: 'https://mock-payphone.com/pay',
        message: 'Pago simulado creado exitosamente'
      }).pipe(delay(1000));
    }
    
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/api/pagos/payphone/crear`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.crearPagoPayphone(data);
      })
    );
  }

  verificarEstadoPago(transactionId: string): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Verificación de pago simulada');
      return of({ 
        success: true, 
        estado: 'completado',
        message: 'Pago verificado exitosamente'
      }).pipe(delay(500));
    }
    
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/pagos/payphone/verificar/${transactionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.verificarEstadoPago(transactionId);
      })
    );
  }

  confirmarPago(transactionId: string, confirmacion: boolean): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Confirmación de pago simulada');
      return of({ 
        success: true, 
        message: confirmacion ? 'Pago confirmado exitosamente' : 'Pago cancelado'
      }).pipe(delay(500));
    }
    
    const token = localStorage.getItem('token');
    return this.http.post(`${this.baseUrl}/api/pagos/payphone/confirmar/${transactionId}`, 
      { confirmacion }, 
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.confirmarPago(transactionId, confirmacion);
      })
    );
  }

  obtenerMisPagos(): Observable<any> {
    if (this.useMockData) {
      console.log('🔧 Modo mock: Pagos del usuario simulados');
      const mockPagos = [
        {
          id: 1,
          monto: 45.99,
          estado: 'completado',
          fecha: '2025-08-01',
          metodo: 'Payphone'
        }
      ];
      return of(mockPagos).pipe(delay(500));
    }
    
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/api/pagos/mis`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Error de conectividad, activando modo mock');
        this.useMockData = true;
        return this.obtenerMisPagos();
      })
    );
  }

  // Método para alternar modo mock (útil para desarrollo)
  toggleMockMode(): void {
    this.useMockData = !this.useMockData;
    console.log(`🔧 Modo mock: ${this.useMockData ? 'ACTIVADO' : 'DESACTIVADO'}`);
  }

  // Método para verificar si está en modo mock
  isMockMode(): boolean {
    return this.useMockData;
  }

  pagarReserva(data: any): Observable<any> {
    // Método legacy para compatibilidad
    return this.crearPagoPayphone(data);
  }
}
