
import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth/guard';
import { roleGuard } from './core/guards/role/guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.RegisterComponent),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },

  // ADMIN ROUTES
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: 'branches',
        loadComponent: () =>
          import('./features/branches/branch-list/branch-list').then(
            (m) => m.BranchList,
          ),
      },

      {
        path: 'branches/create',
        loadComponent: () =>
          import('./features/branches/branch-create/branch-create').then(
            (m) => m.BranchCreateComponent,
          ),
      },

      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointment-list/appointment-list').then(
            (m) => m.AppointmentList,
          ),
      },
    ],
  },

  // CUSTOMER ROUTES
  {
    path: 'appointments',
    canActivate: [authGuard],
    children: [
      {
        path: 'book',
        loadComponent: () =>
          import('./features/appointments/appointment-create/appointment-create').then(
            (m) => m.AppointmentCreate,
          ),
      },

      {
        path: 'my-appointments',
        loadComponent: () =>
          import('./features/appointments/appointment-list/appointment-list').then(
            (m) => m.AppointmentList,
          ),
      },
    ],
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
