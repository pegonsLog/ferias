import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogCreatedComponent } from './dialog-created.component';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';



@NgModule({
  declarations: [
    DialogCreatedComponent
  ],
  imports: [
    CommonModule,
    AngularMaterialModule
  ],
  entryComponents: [DialogCreatedComponent]
})
export class DialogCreatedModule { }
