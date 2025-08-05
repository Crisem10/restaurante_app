import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PerfilPage } from './perfil.page';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PerfilPage],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: PerfilPage }])
  ]
})
export class PerfilPageModule {}
