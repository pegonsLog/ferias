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
import { VacationModule } from '../vacation/vacation.module';
import { MonthListModule } from '../month-list/month-list.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    AngularMaterialModule,
    HeaderModule,
    UserModule,
    VacationModule,
    EmployeesModule,
    FormsModule,
    ReactiveFormsModule,
    SearchModule,
    MonthListModule
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
