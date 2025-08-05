import { Component, OnInit } from '@angular/core';
import { PayphoneService, PagoPayphoneData } from '../services/payphone.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-pago-payphone',
  templateUrl: './pago-payphone.component.html',
  styleUrls: ['./pago-payphone.component.scss']
})
export class PagoPayphoneComponent implements OnInit {
  
  pagoData: PagoPayphoneData = {
    reserva_id: 0,
    monto: 0,
    telefono: '',
    descripcion: ''
  };
  
  transactionId: string = '';
  estadoPago: string = '';
  mostrarVerificacion: boolean = false;

  constructor(
    private payphoneService: PayphoneService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Inicializar datos del componente
  }

  /**
   * Validar los datos del formulario
   */
  validarDatos(): boolean {
    if (!this.pagoData.reserva_id || this.pagoData.reserva_id <= 0) {
      this.mostrarToast('Por favor ingresa un ID de reserva válido', 'warning');
      return false;
    }

    if (!this.pagoData.monto || this.pagoData.monto <= 0) {
      this.mostrarToast('Por favor ingresa un monto válido', 'warning');
      return false;
    }

    if (!this.pagoData.telefono || !this.payphoneService.validarTelefono(this.pagoData.telefono)) {
      this.mostrarToast('Por favor ingresa un número de teléfono válido', 'warning');
      return false;
    }

    return true;
  }

  /**
   * Procesar el pago con Payphone
   */
  async procesarPago() {
    if (!this.validarDatos()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando pago...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Formatear el teléfono
      this.pagoData.telefono = this.payphoneService.formatearTelefono(this.pagoData.telefono);
      
      // Crear el pago
      const response = await this.payphoneService.crearPago(this.pagoData).toPromise();
      
      if (response.success) {
        this.transactionId = response.payphone.transactionId || response.payphone.id;
        this.mostrarVerificacion = true;
        this.mostrarToast('Pago iniciado. Revisa tu teléfono para completar el pago.', 'success');
        
        // Iniciar verificación automática después de 5 segundos
        setTimeout(() => {
          this.verificarEstado();
        }, 5000);
      } else {
        this.mostrarToast('Error al iniciar el pago', 'danger');
      }
    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      this.mostrarToast(error.error?.error || 'Error al procesar el pago', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Verificar el estado del pago
   */
  async verificarEstado() {
    if (!this.transactionId) {
      this.mostrarToast('No hay transacción para verificar', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Verificando estado del pago...',
      spinner: 'dots'
    });
    await loading.present();

    try {
      const response = await this.payphoneService.verificarEstadoPago(this.transactionId).toPromise();
      
      if (response.success) {
        this.estadoPago = response.estado;
        const mensaje = this.payphoneService.getMensajeEstado(this.estadoPago);
        this.mostrarToast(mensaje, this.payphoneService.esPagoExitoso(this.estadoPago) ? 'success' : 'primary');
        
        // Si el pago es exitoso, mostrar confirmación
        if (this.payphoneService.esPagoExitoso(this.estadoPago)) {
          this.mostrarConfirmacionExitosa();
        }
      } else {
        this.mostrarToast('Error al verificar el estado del pago', 'danger');
      }
    } catch (error: any) {
      console.error('Error al verificar estado:', error);
      this.mostrarToast(error.error?.error || 'Error al verificar el estado', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Confirmar el pago manualmente
   */
  async confirmarPago() {
    const alert = await this.alertController.create({
      header: 'Confirmar Pago',
      message: '¿Estás seguro de que quieres confirmar este pago?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            await this.procesarConfirmacion(true);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Cancelar el pago
   */
  async cancelarPago() {
    const alert = await this.alertController.create({
      header: 'Cancelar Pago',
      message: '¿Estás seguro de que quieres cancelar este pago?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          handler: async () => {
            await this.procesarConfirmacion(false);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Procesar la confirmación o cancelación
   */
  private async procesarConfirmacion(confirmado: boolean) {
    const loading = await this.loadingController.create({
      message: confirmado ? 'Confirmando pago...' : 'Cancelando pago...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const response = await this.payphoneService.confirmarPago(this.transactionId, confirmado).toPromise();
      
      if (response.success) {
        this.mostrarToast(response.mensaje, confirmado ? 'success' : 'warning');
        this.resetearFormulario();
      } else {
        this.mostrarToast('Error al procesar la confirmación', 'danger');
      }
    } catch (error: any) {
      console.error('Error al confirmar:', error);
      this.mostrarToast(error.error?.error || 'Error al procesar', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Mostrar alerta de pago exitoso
   */
  private async mostrarConfirmacionExitosa() {
    const alert = await this.alertController.create({
      header: '¡Pago Exitoso!',
      message: 'Tu pago ha sido procesado correctamente. Tu reserva está confirmada.',
      buttons: [
        {
          text: 'Continuar',
          handler: () => {
            this.resetearFormulario();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Resetear el formulario
   */
  resetearFormulario() {
    this.pagoData = {
      reserva_id: 0,
      monto: 0,
      telefono: '',
      descripcion: ''
    };
    this.transactionId = '';
    this.estadoPago = '';
    this.mostrarVerificacion = false;
  }

  /**
   * Mostrar toast con mensaje
   */
  private async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  /**
   * Formatear el teléfono mientras el usuario escribe
   */
  onTelefonoChange() {
    // Aquí puedes agregar lógica para formatear en tiempo real
    if (this.pagoData.telefono && this.payphoneService.validarTelefono(this.pagoData.telefono)) {
      // El teléfono es válido
    }
  }
}
