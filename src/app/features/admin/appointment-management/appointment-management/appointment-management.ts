
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectChange } from '@angular/material/select';
import { AppointmentService } from '../../../../core/services/appointment';
import { AppointmentResponse } from '../../../../Models/appointment/AppointmentResponse';
import { AppointmentStatus } from '../../../../Models/appointment/AppointmentStatus';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  selector: 'app-appointment-management',
  styleUrl: './appointment-management.scss',
  templateUrl: './appointment-management.html',
})
export class AppointmentManagement implements OnInit {
  appointments = signal<AppointmentResponse[]>([]);

  loading = signal(false);
  updating = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  displayedColumns: string[] = [
    'reference',
    'customer',
    'branch',
    'service',
    'date',
    'time',
    'status',
    'updateStatus',
    'actions',
  ];

  statuses: AppointmentStatus[] = ['CONFIRMED', 'CANCELLED', 'COMPLETED','NO_SHOW'];

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        this.appointments.set(data);

        this.loading.set(false);
      },

      error: (error) => {
        this.loading.set(false);

        this.errorMessage.set(error.error?.message || 'Unable to load appointments.');
      },
    });
  }

  updateStatus(item: AppointmentResponse, newStatus: AppointmentStatus): void {
    if (this.updating()) {
      return;
    }

    if (item.status === newStatus) {
      return;
    }

    if (!this.canUpdateStatus(item)) {
      this.errorMessage.set('This appointment can no longer be updated.');
      return;
    }

    this.updating.set(true);

    this.errorMessage.set('');
    this.successMessage.set('');

    let request;

    switch (newStatus) {
      case 'CONFIRMED':
        request = this.appointmentService.confirmAppointment(item.id);
        break;

      case 'CANCELLED':
        request = this.appointmentService.cancelAppointment(item.id);
        break;

      case 'COMPLETED':
        request = this.appointmentService.completeAppointment(item.id);
        break;

      case 'NO_SHOW':
        request = this.appointmentService.noshowAppointment(item.id);
        break;

      default:
        this.updating.set(false);
        this.errorMessage.set('This status is not supported by the available backend actions.');
        this.loadAppointments();
        return;
    }

    request.subscribe({
      next: () => {
        this.updating.set(false);

        this.successMessage.set(
          `Appointment ${item.appointmentReference} status updated successfully.`,
        );

        this.loadAppointments();
      },

      error: (error) => {
        this.updating.set(false);

        this.errorMessage.set(error.error?.message || 'Unable to update appointment status.');

        this.loadAppointments();
      },
    });
  }

  deleteAppointment(appointment: AppointmentResponse): void {
    if (this.updating()) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete appointment ${appointment.appointmentReference}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    this.updating.set(true);

    this.errorMessage.set('');
    this.successMessage.set('');

    this.appointmentService.deleteAppointment(appointment.id).subscribe({
      next: () => {
        this.updating.set(false);

        this.successMessage.set(
          `Appointment ${appointment.appointmentReference} deleted successfully.`,
        );

        this.loadAppointments();
      },

      error: (error) => {
        this.updating.set(false);

        this.errorMessage.set(error.error?.message || 'Unable to delete appointment.');
      },
    });
  }
  canUpdateStatus(appointment: AppointmentResponse): boolean {
    return !['CANCELLED', 'COMPLETED'].includes(appointment.status);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'primary';

      case 'COMPLETED':
        return 'accent';

      case 'CANCELLED':
      case 'NO_SHOW':
        return 'warn';

      default:
        return '';
    }
  }
}
