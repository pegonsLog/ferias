import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";


const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('src/app/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'users',
    loadChildren: () =>
      import('src/app/users/user.module').then((m) => m.UserModule),
  },
  {
    path: 'employees',
    loadChildren: () =>
      import('src/app/employees/employees.module').then((m) => m.EmployeesModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('src/app/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'ferias',
    loadChildren: () =>
      import('src/app/ferias/ferias.module').then((m) => m.FeriasModule),
  },
  {
    path: 'search',
    loadChildren: () =>
      import('src/app/search/search.module').then((m) => m.SearchModule),
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
