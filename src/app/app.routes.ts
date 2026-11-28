import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth/guard';
import { roleGuard } from './core/guards/role/guard';

import { AppointmentDetailsComponent } from './features/appointments/appointment-details/appointment-details';

import { RescheduleAppointment } from './features/customer/appointments/reschedule-appointment/reschedule-appointment';

import { AppointmentConfirmation } from './features/customer/appointments/appointment-confirmation/appointment-confirmation';
import { Reports } from './features/admin/reports/reports';

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
    canActivate: [authGuard, roleGuard],
    data: { role: ['ADMIN', 'STAFF'] },
    loadComponent: () =>
      import('./features/dashboard/admin/dashboard').then((m) => m.AdminDashboardComponent),
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: ['ADMIN', 'STAFF'] },

    children: [
      {
        path: 'branches',
        loadComponent: () =>
          import('./features/branches/branch-list/branch-list').then((m) => m.BranchListComponent),
      },

      {
        path: 'branches/create',
        loadComponent: () =>
          import('./features/branches/branch-create/branch-create').then(
            (m) => m.BranchCreateComponent,
          ),
      },
      {
        path: 'appointments/:id/reschedule',
        component: RescheduleAppointment,
      },

      {
        path: 'appointments/:id',
        component: AppointmentDetailsComponent,
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/admin/appointment-management/appointment-management/appointment-management').then(
            (m) => m.AppointmentManagement,
          ),
      },

      {
        path: '',
        redirectTo: 'appointments',
        pathMatch: 'full',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/user-management/user-management/user-management').then(
            (m) => m.UserManagement,
          ),
      },
      {
        path: 'users/create',
        loadComponent: () =>
          import('./features/admin/user-management/user-create/user-create').then(
            (m) => m.UserCreate,
          ),
      },
      {
        path: 'users/edit/:id',
        loadComponent: () =>
          import('./features/admin/user-management/user-edit/user-edit').then((m) => m.UserEdit),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin/reports/reports').then((m) => m.Reports),
      },
    ],
  },

  {
    path: 'customer',
    canActivate: [authGuard],

    children: [
      {
        path: 'appointments/book',
        loadComponent: () =>
          import('./features/appointments/appointment-create/appointment-create').then(
            (m) => m.AppointmentCreateComponent,
          ),
      },

      {
        path: 'appointments/:id/reschedule',
        component: RescheduleAppointment,
      },

      {
        path: 'appointments/:id/confirmation',
        component: AppointmentConfirmation,
      },

      {
        path: 'appointments/:id',
        component: AppointmentDetailsComponent,
      },

      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointment-list/appointment-list').then(
            (m) => m.AppointmentListComponent,
          ),
      },

      {
        path: '',
        redirectTo: 'appointments',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'customer',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('././features/dashboard/customer/customer-dashboard/customer-dashboard').then(
            (m) => m.CustomerDashboardComponent,
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
