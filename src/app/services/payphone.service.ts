import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PagoPayphoneData {
  reserva_id: number;
  monto: number;
  telefono: string;
  descripcion?: string;
}

export interface EstadoPago {
  success: boolean;
  estado: string;
  pago: any;
  payphone: any;
}

@Injectable({
  providedIn: 'root'
})
export class PayphoneService {
  
  constructor(private apiService: ApiService) {}

  /**
   * Crear un nuevo pago con Payphone
   * @param pagoData - Datos del pago
   * @returns Observable con la respuesta del pago
   */
  crearPago(pagoData: PagoPayphoneData): Observable<any> {
    return this.apiService.crearPagoPayphone(pagoData);
  }

  /**
   * Verificar el estado de un pago
   * @param transactionId - ID de la transacción
   * @returns Observable con el estado del pago
   */
  verificarEstadoPago(transactionId: string): Observable<EstadoPago> {
    return this.apiService.verificarEstadoPago(transactionId);
  }

  /**
   * Confirmar un pago
   * @param transactionId - ID de la transacción
   * @param confirmado - Si el pago fue confirmado o no
   * @returns Observable con la confirmación
   */
  confirmarPago(transactionId: string, confirmado: boolean = true): Observable<any> {
    return this.apiService.confirmarPago(transactionId, { confirmacion: confirmado });
  }

  /**
   * Validar número de teléfono para Ecuador
   * @param telefono - Número de teléfono
   * @returns boolean indicando si es válido
   */
  validarTelefono(telefono: string): boolean {
    // Formato para Ecuador: +593 seguido de 9 dígitos
    // Acepta formatos: +593987654321, 0987654321, 987654321
    const regex = /^(\+593|0)?[0-9]{9}$/;
    return regex.test(telefono.replace(/\s/g, ''));
  }

  /**
   * Formatear número de teléfono para Ecuador
   * @param telefono - Número de teléfono
   * @returns Número formateado
   */
  formatearTelefono(telefono: string): string {
    // Limpiar el teléfono
    let telefonoLimpio = telefono.replace(/\s/g, '').replace(/[^\d]/g, '');
    
    // Si empieza con 0, quitarlo
    if (telefonoLimpio.startsWith('0')) {
      telefonoLimpio = telefonoLimpio.substring(1);
    }
    
    // Agregar código de país si no lo tiene
    if (!telefonoLimpio.startsWith('593')) {
      telefonoLimpio = '593' + telefonoLimpio;
    }
    
    return '+' + telefonoLimpio;
  }

  /**
   * Obtener los estados de pago disponibles
   * @returns Array con los estados de pago
   */
  getEstadosPago(): string[] {
    return [
      'pendiente',
      'procesando',
      'approved',
      'completed',
      'failed',
      'cancelled',
      'expired'
    ];
  }

  /**
   * Verificar si un estado de pago es exitoso
   * @param estado - Estado del pago
   * @returns boolean indicando si es exitoso
   */
  esPagoExitoso(estado: string): boolean {
    return ['approved', 'completed', 'confirmado'].includes(estado.toLowerCase());
  }

  /**
   * Obtener mensaje legible del estado del pago
   * @param estado - Estado del pago
   * @returns Mensaje descriptivo del estado
   */
  getMensajeEstado(estado: string): string {
    const mensajes: { [key: string]: string } = {
      'pendiente': 'Pago pendiente - Esperando confirmación',
      'procesando': 'Procesando pago...',
      'approved': 'Pago aprobado exitosamente',
      'completed': 'Pago completado',
      'failed': 'El pago falló. Intenta nuevamente',
      'cancelled': 'Pago cancelado',
      'expired': 'El pago expiró. Intenta nuevamente',
      'confirmado': 'Pago confirmado'
    };
    
    return mensajes[estado.toLowerCase()] || `Estado: ${estado}`;
  }
}
