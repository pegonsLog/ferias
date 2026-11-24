import { inject } from '@angular/core';
import { RedirectFunction, Router, Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth-guards';

const loadVacationSearch = () =>
  import('./features/vacations/vacation-search-page').then((m) => m.VacationSearchPage);

/** Endereço antigo da lista mensal (`/month-list?monthSearch=08&yearSearch=2023`). */
const legacyMonthList: RedirectFunction = ({ queryParams }) =>
  inject(Router).createUrlTree(['/relatorios/lista-mensal'], {
    queryParams: { mes: queryParams['monthSearch'], ano: queryParams['yearSearch'] },
  });

export const routes: Routes = [
  {
    path: 'login',
    title: 'Entrar',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./core/layout/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'Início',
        data: { section: 'Geral' },
        loadComponent: () =>
          import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'ferias',
        data: { section: 'Consultas' },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'funcionario' },
          {
            path: 'funcionario',
            title: 'Férias do funcionário',
            data: { mode: 'employee' },
            loadComponent: loadVacationSearch,
          },
          {
            path: 'mes',
            title: 'Férias do mês',
            data: { mode: 'month' },
            loadComponent: loadVacationSearch,
          },
          {
            path: 'ano',
            title: 'Férias do ano',
            data: { mode: 'year' },
            loadComponent: loadVacationSearch,
          },
        ],
      },
      {
        path: 'relatorios/lista-mensal',
        title: 'Lista mensal',
        data: { section: 'Impressão' },
        loadComponent: () =>
          import('./features/reports/monthly-report-page').then((m) => m.MonthlyReportPage),
      },
      {
        path: 'funcionarios',
        title: 'Funcionários',
        data: { section: 'Manutenção' },
        loadComponent: () =>
          import('./features/employees/employees-page').then((m) => m.EmployeesPage),
      },
      {
        path: 'usuarios',
        title: 'Usuários',
        data: { section: 'Manutenção' },
        loadComponent: () => import('./features/users/users-page').then((m) => m.UsersPage),
      },
      // Endereços da versão anterior, mantidos para favoritos antigos.
      { path: 'home', redirectTo: 'inicio' },
      { path: 'month-list', redirectTo: legacyMonthList },
    ],
  },
  { path: '**', redirectTo: '' },
];
