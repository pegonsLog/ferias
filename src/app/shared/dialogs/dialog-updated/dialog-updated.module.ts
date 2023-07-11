import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogUpdatedComponent } from './dialog-updated.component';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';



@NgModule({
  declarations: [DialogUpdatedComponent],
  imports: [
    CommonModule,
    AngularMaterialModule
  ],
  entryComponents: [DialogUpdatedComponent],
})
export class DialogUpdatedModule { }
