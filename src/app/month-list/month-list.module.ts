import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonthListRoutingModule } from './month-list-routing.module';
import { ListComponent } from './list/list.component';
import { AngularMaterialModule } from '../shared/angular-material/angular-material.module';
import { FormsModule } from '@angular/forms';
import { SearchListComponent } from './search/search-list.component';

@NgModule({
  declarations: [ListComponent, SearchListComponent],
  imports: [
    CommonModule,
    MonthListRoutingModule,
    AngularMaterialModule,
    FormsModule,
  ],
  exports: [ListComponent, SearchListComponent],
})
export class MonthListModule {}
