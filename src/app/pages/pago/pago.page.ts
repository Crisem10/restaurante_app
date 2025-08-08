import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainTabBarComponent } from '../../components/main-tab-bar.component';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, MainTabBarComponent],
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss']
})
export class PagoPage {
  pagoForm: FormGroup;
  estado: string = '';
  mensaje: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.pagoForm = this.fb.group({
      reserva_id: ['', Validators.required],
      metodo_pago: ['payphone', Validators.required],
      monto: ['', Validators.required],
      telefono: ['', Validators.required]
    });
    // Prellenar datos si vienen por queryParams
    this.route.queryParams.subscribe(params => {
      if (params['reserva_id']) {
        this.pagoForm.patchValue({ reserva_id: params['reserva_id'] });
      }
      if (params['monto']) {
        this.pagoForm.patchValue({ monto: params['monto'] });
      }
    });
  }

  realizarPago() {
    if (this.pagoForm.invalid) return;
    this.loading = true;
    this.api.pagarReserva(this.pagoForm.value).subscribe({
      next: (resp: any) => {
        this.estado = resp.pago?.estado_pago || resp.payphone?.status || 'pendiente';
        this.mensaje = 'Pago realizado correctamente';
        this.loading = false;
      },
      error: err => {
        this.mensaje = err.error?.error || 'Error al procesar el pago';
        this.loading = false;
      }
    });
  }
}
