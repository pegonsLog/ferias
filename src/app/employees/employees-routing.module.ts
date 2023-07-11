import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesCreateComponent } from './employees-create/employees-create.component';
import { EmployeesUpdateComponent } from './employees-update/employees-update.component';

const routes: Routes = [
  { path: 'new', component: EmployeesCreateComponent },
  { path: 'edit', component: EmployeesUpdateComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeesRoutingModule {}
