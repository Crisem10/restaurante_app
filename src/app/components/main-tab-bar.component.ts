import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'main-tab-bar',
  templateUrl: './main-tab-bar.component.html',
  styleUrls: ['./main-tab-bar.component.scss'],
  standalone: true,
  imports: [RouterModule]
})
export class MainTabBarComponent {}
