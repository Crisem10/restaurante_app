import { Component, OnInit } from '@angular/core';
import { IonicModule, AnimationController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { MainTabBarComponent } from '../../components/main-tab-bar.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [IonicModule, CommonModule, MainTabBarComponent],
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss']
})
export class MenuPage implements OnInit {
  menuItems: any[] = [];
  itemsFiltrados: any[] = [];
  categorias: string[] = ['Todos'];
  categoriaSeleccionada: string = 'Todos';
  loading = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private animationCtrl: AnimationController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadMenu();
  }

  loadMenu() {
    this.loading = true;
    this.apiService.obtenerMenu().subscribe({
      next: (data: any) => {
        this.menuItems = data;
        this.itemsFiltrados = [...this.menuItems];
        this.extraerCategorias();
        this.loading = false;
        this.animateMenuItems();
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el menú.';
        this.loading = false;
      }
    });
  }

  extraerCategorias() {
    const categoriasUnicas = [...new Set(this.menuItems.map(item => item.categoria))];
    this.categorias = ['Todos', ...categoriasUnicas];
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    
    if (categoria === 'Todos') {
      this.itemsFiltrados = [...this.menuItems];
    } else {
      this.itemsFiltrados = this.menuItems.filter(item => item.categoria === categoria);
    }
    
    this.animateMenuItems();
  }

  async animateMenuItems() {
    const cards = document.querySelectorAll('.menu-card');
    if (cards.length > 0) {
      const animation = this.animationCtrl
        .create()
        .addElement(cards)
        .duration(600)
        .easing('ease-out')
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(20px)', 'translateY(0px)');

      await animation.play();
    }
  }

  async verDetalleItem(item: any) {
    const alert = await this.alertController.create({
      header: item.nombre,
      subHeader: `$${item.precio} - ${item.tiempo_preparacion} minutos`,
      message: `
        <div style="text-align: left;">
          <p><strong>Descripción:</strong><br>${item.descripcion}</p>
          <p><strong>Categoría:</strong> ${item.categoria}</p>
          <p><strong>Estado:</strong> ${item.disponible ? 'Disponible' : 'No disponible'}</p>
        </div>
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        },
        {
          text: 'Agregar al pedido',
          handler: () => {
            if (item.disponible) {
              console.log('Agregando al pedido:', item);
              // Aquí puedes implementar la lógica para agregar al carrito
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
