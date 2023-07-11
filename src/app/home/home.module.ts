import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeesModule } from '../employees/employees.module';
import { HeaderModule } from '../header/header.module';
import { SearchModule } from '../search/search.module';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';
import { UserModule } from '../users/user.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { FeriasModule } from '../ferias/ferias.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    AngularMaterialModule,
    HeaderModule,
    UserModule,
    FeriasModule,
    EmployeesModule,
    FormsModule,
    ReactiveFormsModule,
    SearchModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
