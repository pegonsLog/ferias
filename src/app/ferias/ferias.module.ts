import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeriasRoutingModule } from './ferias-routing.module';
import { FeriasCreateComponent } from './ferias-create/ferias-create.component';
import { FeriasUpdateComponent } from './ferias-update/ferias-update.component';
import { FeriasListComponent } from './ferias-list/ferias-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InputMaskModule } from '@ngneat/input-mask';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';
import { ConfirmationModule } from '../shared/dialogs/confirmation/confirmation.module';

@NgModule({
  declarations: [
    FeriasCreateComponent,
    FeriasUpdateComponent,
    FeriasListComponent,
  ],
  imports: [
    CommonModule,
    FeriasRoutingModule,
    ConfirmationModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    InputMaskModule,
  ],
  exports: [FeriasCreateComponent, FeriasUpdateComponent, FeriasListComponent],
})
export class FeriasModule {}
