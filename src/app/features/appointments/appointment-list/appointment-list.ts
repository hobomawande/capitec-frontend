
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentService } from '../../../core/services/appointment';
import { AuthService } from '../../../core/services/auth';
import { AppointmentResponse } from '../../../Models/appointment/AppointmentResponse';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DatePipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    MatNativeDateModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    DatePipe,
  ],
  selector: 'app-appointment-list',
  styleUrl: './appointment-list.css',
  templateUrl: './appointment-list.html',
})
export class AppointmentListComponent implements OnInit {
  appointments = signal<AppointmentResponse[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  isAdmin = false;

  displayedColumns = [
    'referenceNumber',
    'branchName',
    'serviceName',
    'appointmentDate',
    'appointmentTime',
    'status',
    'actions',
  ];

  constructor(
    private appointmentService: AppointmentService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.hasRole('ADMIN');
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    // @ts-ignore
    var id: string = this.auth.getCurrentUser()?.staffId;

    const request = this.isAdmin
      ? this.appointmentService.getAllAppointments()
      : this.appointmentService.getMyAppointments(id);

    request.subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Unable to load appointments. Please try again.');
      },
    });
  }

  viewAppointment(appointment: AppointmentResponse): void {
    const route = this.isAdmin
      ? ['/admin/appointments', appointment.id]
      : ['/customer/appointments', appointment.id];

    this.router.navigate(route);
  }

  rescheduleAppointment(appointment: AppointmentResponse): void {
    if (!this.canManageAppointment(appointment)) {
      return;
    }

    this.router.navigate(['/customer/appointments', appointment.id, 'reschedule']);
  }

  cancelAppointment(appointment: AppointmentResponse): void {
    if (!this.canManageAppointment(appointment)) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel appointment ${appointment.appointmentReference}?`,
    );

    if (!confirmed) {
      return;
    }

    this.appointmentService.cancelAppointment(appointment.id).subscribe({
      next: () => {
        this.successMessage.set('Appointment cancelled successfully.');
        this.loadAppointments();
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Unable to cancel appointment.');
      },
    });
  }

  canManageAppointment(appointment: AppointmentResponse): boolean {
    return (
      !this.isAdmin &&
      appointment.status !== 'CANCELLED' &&
      appointment.status !== 'COMPLETED' &&
      appointment.status !== 'NO_SHOW'
    );
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'BOOKED':
        return 'primary';
      case 'CONFIRMED':
        return 'accent';
      case 'COMPLETED':
        return 'primary';
      case 'CANCELLED':
        return 'warn';
      default:
        return '';
    }
  }
  goToDashboard(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/customer/dashboard']);
    }
  }
}
