
import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth/guard';
import { roleGuard } from './core/guards/role/guard';
import { AppointmentDetailsComponent } from './features/appointments/appointment-details/appointment-details';
import { RescheduleAppointment } from './features/customer/appointments/reschedule-appointment/reschedule-appointment';
import {
  AppointmentConfirmation
} from './features/customer/appointments/appointment-confirmation/appointment-confirmation';

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
      import('./features/dashboard/admin/dashboard').then((m) => m.AdminDashboardComponent),
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
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/appointment-list/appointment-list').then(
            (m) => m.AppointmentListComponent,
          ),
      },
      {
        path: 'admin/appointments/:id',
        loadComponent: () =>
          import('./features/appointments/appointment-details/appointment-details').then(
            (m) => m.AppointmentDetailsComponent,
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
            (m) => m.AppointmentCreateComponent,
          ),
      },

      {
        path: 'my-appointments',
        loadComponent: () =>
          import('./features/appointments/appointment-list/appointment-list').then(
            (m) => m.AppointmentListComponent,
          ),
      },
      {
        path: 'customer/appointments/:id',
        loadComponent: () =>
          import('./features/appointments/appointment-details/appointment-details').then(
            (m) => m.AppointmentDetailsComponent,
          ),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('././features/customer/appointments/customer-appointments/customer-appointments').then(
            (m) => m.CustomerAppointmentsComponent,
          ),
      },
      {
        path: 'appointments/book',
        loadComponent: () =>
          import('././features/appointments/appointment-create/appointment-create').then(
            (m) => m.AppointmentCreateComponent,
          ),
      },
      {
        path: 'appointments/:id',
        loadComponent: () =>
          import('././features/appointments/appointment-details/appointment-details').then(
            (m) => m.AppointmentDetailsComponent,
          ),
      },
      {
        path: 'appointments/:id',
        component: AppointmentDetailsComponent,
      },
      {
        path: 'appointments/:id/reschedule',
        component: RescheduleAppointment,
      },
      {
        path: 'appointments/:id/confirmation',
        component: AppointmentConfirmation,
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
