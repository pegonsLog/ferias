import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeesCreateComponent } from './employees-create/employees-create.component';
import { EmployeesUpdateComponent } from './employees-update/employees-update.component';
import { EmployeesListComponent } from './employees-list/employees-list.component';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationModule } from '../shared/dialogs/confirmation/confirmation.module';
import { InputMaskModule } from '@ngneat/input-mask';


@NgModule({
  declarations: [
    EmployeesCreateComponent,
    EmployeesUpdateComponent,
    EmployeesListComponent
  ],
  imports: [
    CommonModule,
    EmployeesRoutingModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    ConfirmationModule,
    InputMaskModule,
  ],
  exports: [
    EmployeesCreateComponent,
    EmployeesUpdateComponent,
    EmployeesListComponent
  ]
})
export class EmployeesModule { }
