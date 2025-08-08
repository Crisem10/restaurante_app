import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { MainTabBarComponent } from '../../components/main-tab-bar.component';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, MainTabBarComponent],
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss']
})
export class ReservasPage implements OnInit {
  reservaForm: FormGroup;
  mesasDisponibles: any[] = [];
  mesasFiltradas: any[] = [];
  fechaMinima: string = '';
  fechaMaxima: string = '';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    // Configurar fechas mínima y máxima
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    
    const maxFecha = new Date();
    maxFecha.setMonth(maxFecha.getMonth() + 3); // 3 meses adelante
    this.fechaMaxima = maxFecha.toISOString().split('T')[0];

    this.reservaForm = this.formBuilder.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      personas: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
      preferencias_asiento: [''],
      mesa_id: ['', Validators.required]
    });

    // Log inicial para verificar el valor
    console.log('🔄 Valor inicial de personas:', this.reservaForm.get('personas')?.value);

    // Escuchar cambios en el número de personas para filtrar mesas
    this.reservaForm.get('personas')?.valueChanges.subscribe(personas => {
      this.filtrarMesasPorCapacidad(personas);
    });
  }

  ngOnInit() {
    this.cargarMesasDisponibles();
  }

  async cargarMesasDisponibles() {
    const loading = await this.loadingController.create({
      message: 'Cargando mesas disponibles...',
      spinner: 'crescent'
    });
    await loading.present();

    this.apiService.obtenerMesasDisponibles().subscribe({
      next: (data: any) => {
        console.log('🏪 Mesas recibidas del backend:', data);
        console.log('📊 Cantidad de mesas:', data.length);
        
        // Ordenar las mesas por número
        data.sort((a: any, b: any) => {
          const numeroA = parseInt(a.numero);
          const numeroB = parseInt(b.numero);
          return numeroA - numeroB;
        });
        
        data.forEach((mesa: any) => {
          console.log(`- Mesa ${mesa.numero}: ${mesa.capacidad} personas`);
        });
        
        this.mesasDisponibles = data;
        this.filtrarMesasPorCapacidad(this.reservaForm.get('personas')?.value || 2);
        loading.dismiss();
      },
      error: async (err) => {
        console.error('❌ Error al cargar mesas disponibles:', err);
        loading.dismiss();
        await this.mostrarToast('Error al cargar las mesas disponibles', 'danger');
      }
    });
  }

  filtrarMesasPorCapacidad(personas: number) {
    // Filtrar mesas que puedan acomodar al número de personas
    // Mostrar mesas con capacidad desde el número de personas hasta un máximo más flexible
    this.mesasFiltradas = this.mesasDisponibles.filter(mesa => 
      mesa.capacidad >= personas
    );
    
    // Si la mesa seleccionada ya no está disponible, limpiar la selección
    const mesaSeleccionada = this.reservaForm.get('mesa_id')?.value;
    if (mesaSeleccionada && !this.mesasFiltradas.find(m => m.id === mesaSeleccionada)) {
      this.reservaForm.patchValue({ mesa_id: '' });
    }
  }

  incrementarPersonas() {
    const personas = this.reservaForm.get('personas')?.value || 2;
    if (personas < 8) {
      const nuevasPersonas = personas + 1;
      this.reservaForm.patchValue({ personas: nuevasPersonas });
      console.log(`👥 Incrementado a ${nuevasPersonas} personas`);
      this.filtrarMesasPorCapacidad(nuevasPersonas);
    }
  }

  decrementarPersonas() {
    const personas = this.reservaForm.get('personas')?.value || 2;
    if (personas > 1) {
      const nuevasPersonas = personas - 1;
      this.reservaForm.patchValue({ personas: nuevasPersonas });
      console.log(`👥 Decrementado a ${nuevasPersonas} personas`);
      this.filtrarMesasPorCapacidad(nuevasPersonas);
    }
  }

  // Método adicional para establecer directamente el número de personas
  establecerPersonas(numero: number) {
    if (numero >= 1 && numero <= 8) {
      this.reservaForm.patchValue({ personas: numero });
      console.log(`👥 Establecido a ${numero} personas`);
      this.filtrarMesasPorCapacidad(numero);
    }
  }

  seleccionarMesa(mesa: any) {
    this.reservaForm.patchValue({ mesa_id: mesa.id });
  }

  async enviarReserva() {
    if (this.reservaForm.invalid) {
      await this.mostrarErroresValidacion();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando reserva...',
      spinner: 'crescent'
    });
    await loading.present();

    const datos = {
      ...this.reservaForm.value,
      // Convertir fecha y hora al formato correcto
      fecha: this.reservaForm.value.fecha,
      hora: this.reservaForm.value.hora
    };

    console.log('📤 Enviando datos de reserva:', datos);

    this.apiService.crearReserva(datos).subscribe({
      next: async (response) => {
        console.log('✅ Reserva creada exitosamente:', response);
        loading.dismiss();
        
        // Mostrar confirmación exitosa
        await this.mostrarConfirmacionExitosa();
        
        // Navegar de vuelta al home
        this.router.navigate(['/home']);
      },
      error: async (err) => {
        console.error('❌ Error al crear reserva:', err);
        loading.dismiss();
        
        const mensaje = err.error?.error || err.message || 'Error desconocido';
        await this.mostrarToast(`Error al procesar la reserva: ${mensaje}`, 'danger');
      }
    });
  }

  async mostrarErroresValidacion() {
    const errores: string[] = [];
    
    Object.keys(this.reservaForm.controls).forEach(key => {
      const control = this.reservaForm.get(key);
      if (control && control.invalid && control.errors) {
        switch (key) {
          case 'fecha':
            errores.push('• Selecciona una fecha válida');
            break;
          case 'hora':
            errores.push('• Selecciona una hora válida');
            break;
          case 'personas':
            errores.push('• El número de personas debe ser entre 1 y 8');
            break;
          case 'mesa_id':
            errores.push('• Selecciona una mesa disponible');
            break;
        }
      }
    });

    const alert = await this.alertController.create({
      header: 'Campos requeridos',
      message: `Por favor completa los siguientes campos:\n\n${errores.join('\n')}`,
      buttons: ['Entendido']
    });

    await alert.present();
  }

  async mostrarConfirmacionExitosa() {
    const mesaSeleccionada = this.mesasFiltradas.find(m => m.id === this.reservaForm.value.mesa_id);
    
    const alert = await this.alertController.create({
      header: '¡Reserva Confirmada! 🎉',
      message: `
        <div style="text-align: left; margin-top: 16px;">
          <p><strong>Detalles de tu reserva:</strong></p>
          <p>📅 <strong>Fecha:</strong> ${new Date(this.reservaForm.value.fecha).toLocaleDateString()}</p>
          <p>🕐 <strong>Hora:</strong> ${this.reservaForm.value.hora}</p>
          <p>👥 <strong>Personas:</strong> ${this.reservaForm.value.personas}</p>
          <p>🏪 <strong>Mesa:</strong> ${mesaSeleccionada?.numero} (Capacidad: ${mesaSeleccionada?.capacidad})</p>
          ${this.reservaForm.value.preferencias_asiento ? 
            `<p>💬 <strong>Preferencias:</strong> ${this.reservaForm.value.preferencias_asiento}</p>` : ''}
        </div>
        <p style="margin-top: 16px; color: #666; font-size: 14px;">
          Te esperamos en nuestro restaurante. ¡Que disfrutes tu experiencia!
        </p>
      `,
      buttons: ['¡Perfecto!']
    });

    await alert.present();
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: color,
      buttons: [
        {
          text: 'X',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  limpiarFormulario() {
    this.reservaForm.reset({
      fecha: '',
      hora: '',
      personas: 2,
      preferencias_asiento: '',
      mesa_id: ''
    });
    this.filtrarMesasPorCapacidad(2);
  }

  debugFormulario() {
    console.log('🔍 DEBUG FORMULARIO:');
    console.log('Válido:', this.reservaForm.valid);
    console.log('Valor:', this.reservaForm.value);
    console.log('Estado de cada campo:');
    Object.keys(this.reservaForm.controls).forEach(key => {
      const control = this.reservaForm.get(key);
      console.log(`- ${key}: válido=${control?.valid}, valor=${control?.value}, errores=`, control?.errors);
    });
    
    this.mostrarToast(`Formulario ${this.reservaForm.valid ? 'VÁLIDO ✅' : 'INVÁLIDO ❌'}`, 
                     this.reservaForm.valid ? 'success' : 'warning');
  }
}
