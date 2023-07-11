import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRoutingModule } from './user-routing.module';
import { UserUpdateComponent } from './user-update/user-update.component';
import { ConfirmationModule } from '../shared/dialogs/confirmation/confirmation.module';

@NgModule({
  declarations: [UserListComponent, UserCreateComponent, UserUpdateComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    ConfirmationModule,
  ],
  exports: [UserListComponent, UserCreateComponent, UserUpdateComponent],
})
export class UserModule {}
