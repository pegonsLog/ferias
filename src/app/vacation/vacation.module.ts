import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { VacationCreateComponent } from './vacation-create/vacation-create.component';
import { VacationRoutingModule } from './vacation-routing.module';

import { ReactiveFormsModule } from '@angular/forms';
import { InputMaskModule } from '@ngneat/input-mask';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';
import { ConfirmationModule } from '../shared/dialogs/confirmation/confirmation.module';
import { VacationListComponent } from './vacation-list/vacation-list.component';
import { VacationUpdateComponent } from './vacation-update/vacation-update.component';

@NgModule({
  declarations: [
    VacationCreateComponent,
    VacationUpdateComponent,
    VacationListComponent,
  ],
  imports: [
    CommonModule,
    VacationRoutingModule,
    ConfirmationModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    InputMaskModule,
  ],
  exports: [
    VacationCreateComponent,
    VacationUpdateComponent,
    VacationListComponent,
  ],
})
export class VacationModule {}
