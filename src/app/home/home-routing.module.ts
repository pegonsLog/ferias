import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { GuardHome } from '../shared/guards/guardHome';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [GuardHome]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
