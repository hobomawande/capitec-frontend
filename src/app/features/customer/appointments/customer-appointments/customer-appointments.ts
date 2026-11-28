
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppointmentService } from '../../../../core/services/appointment';
import { AppointmentResponse } from '../../../../Models/appointment/AppointmentResponse';
import { AuthService } from '../../../../core/services/auth';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterLink,
  ],
  selector: 'app-customer-appointments',
  styleUrl: './customer-appointments.scss',
  templateUrl: './customer-appointments.html',
})
export class CustomerAppointmentsComponent implements OnInit {
  appointments = signal<AppointmentResponse[]>([]);
  loading = signal(true);
  errorMessage = signal('');

  searchTerm = signal('');
  selectedFilter = signal('ALL');
  today = () => new Date().toISOString().slice(0, 10);
  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    // @ts-ignore
    this.appointmentService.getMyAppointments(this.auth.getCurrentUser()?.staffId).subscribe({
      next: (response) => {
        this.appointments.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load your appointments. Please try again.');
        this.loading.set(false);
      },
    });
  }

  filteredAppointments(): AppointmentResponse[] {
    const today = new Date().toISOString().slice(0, 10);
    const filter = this.selectedFilter();
    const search = this.searchTerm().toLowerCase().trim();

    return this.appointments().filter((appointment) => {
      const status = appointment.status.toUpperCase();

      const isUpcoming =
        appointment.appointmentDate >= today && status !== 'CANCELLED' && status !== 'COMPLETED';

      let matchesFilter = true;

      switch (filter) {
        case 'UPCOMING':
          matchesFilter = isUpcoming;
          break;

        case 'COMPLETED':
          matchesFilter = status === 'COMPLETED';
          break;

        case 'CANCELLED':
          matchesFilter = status === 'CANCELLED';
          break;
      }

      const matchesSearch =
        appointment.branchName.toLowerCase().includes(search) ||
        appointment.appointmentReference.toLowerCase().includes(search) ||
        appointment.reason.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }

  setSearch(value: string): void {
    this.searchTerm.set(value);
  }

  setFilter(value: string): void {
    this.selectedFilter.set(value);
  }

  viewAppointment(appointment: AppointmentResponse): void {
    this.router.navigate(['/customer/appointments', appointment.id]);
  }

  cancelAppointment(appointment: AppointmentResponse): void {
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to cancel appointment ${appointment.appointmentReference}?`,
    );

    if (!confirmed) {
      return;
    }

    this.appointmentService.cancelAppointment(appointment.id).subscribe({
      next: () => {
        this.loadAppointments();
      },
      error: () => {
        this.errorMessage.set('Unable to cancel this appointment. Please try again.');
      },
    });
  }

  canCancel(appointment: AppointmentResponse): boolean {
    const status = appointment.status.toUpperCase();

    return status !== 'CANCELLED' && status !== 'COMPLETED';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}




