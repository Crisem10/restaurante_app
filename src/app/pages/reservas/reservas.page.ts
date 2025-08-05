import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss']
})
export class ReservasPage implements OnInit {
  reservaForm: FormGroup;
  mesasDisponibles: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {
    this.reservaForm = this.formBuilder.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      personas: [1, Validators.required],
      preferencias_asiento: [''],
      mesa_id: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cargarMesasDisponibles();
  }

  cargarMesasDisponibles() {
    this.apiService.obtenerMesasDisponibles().subscribe({
      next: (data: any) => {
        this.mesasDisponibles = data;
      },
      error: (err) => {
        console.error('Error al cargar mesas disponibles:', err);
      }
    });
  }

  enviarReserva() {
    console.log('🔄 Intentando enviar reserva...');
    console.log('📝 Formulario válido:', this.reservaForm.valid);
    console.log('📋 Datos:', this.reservaForm.value);
    
    if (this.reservaForm.invalid) {
      console.log('❌ Formulario inválido');
      // Mostrar qué campos están inválidos
      Object.keys(this.reservaForm.controls).forEach(key => {
        const control = this.reservaForm.get(key);
        if (control && control.invalid) {
          console.log(`Campo ${key} inválido:`, control.errors);
        }
      });
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    
    const datos = this.reservaForm.value;
    console.log('📤 Enviando datos:', datos);
    
    // Ya no necesitamos enviar usuario_id porque el backend lo obtiene del token
    
    this.apiService.crearReserva(datos).subscribe({
      next: (response) => {
        console.log('✅ Respuesta exitosa:', response);
        alert('¡Reserva registrada con éxito!');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('❌ Error al registrar reserva:', err);
        alert('Error al registrar la reserva: ' + (err.error?.error || err.message));
      }
    });
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
    alert(`Formulario ${this.reservaForm.valid ? 'VÁLIDO' : 'INVÁLIDO'}`);
  }
}
