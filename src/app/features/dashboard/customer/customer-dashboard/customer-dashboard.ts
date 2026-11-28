
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppointmentService } from '../../../../core/services/appointment';
import { AuthService } from '../../../../core/services/auth';
import { AppointmentResponse } from '../../../../Models/appointment/AppointmentResponse';


@Component({
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  selector: 'app-customer-dashboard',
  styleUrl: './customer-dashboard.css',
  templateUrl: './customer-dashboard.html',
})
export class CustomerDashboardComponent implements OnInit {
  appointments = signal<AppointmentResponse[]>([]);

  totalAppointments = signal(0);
  upcomingAppointments = signal(0);

  loading = signal(false);
  errorMessage = signal('');

  firstName = '';

  constructor(
    private appointmentService: AppointmentService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.firstName = this.auth.getCurrentUser()?.fullName ?? 'Customer';

    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    // @ts-ignore
    this.appointmentService.getMyAppointments(this.auth.getCurrentUser().staffId).subscribe({
      next: (appointments: AppointmentResponse[]) => {
        const savedAppointments = appointments ?? [];

        this.appointments.set(savedAppointments);

        this.totalAppointments.set(savedAppointments.length);

        const today = this.getTodayDate();

        const upcoming = savedAppointments.filter((appointment) => {
          const status = appointment.status?.toUpperCase();

          const appointmentDate = String(appointment.appointmentDate).slice(0, 10);

          return appointmentDate >= today && status !== 'CANCELLED' && status !== 'COMPLETED';
        });

        this.upcomingAppointments.set(upcoming.length);

        this.loading.set(false);
      },

      error: (error) => {
        console.error('Failed to load appointments:', error);

        this.errorMessage =
          error.error?.message ?? 'Unable to load your appointments. Please try again.';

        this.appointments.set([]);
        this.totalAppointments.set(0);
        this.upcomingAppointments.set(0);

        this.loading.set(false);
      },
    });
  }

  private getTodayDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  viewAppointment(appointment: AppointmentResponse): void {
    this.router.navigate(['/customer/appointments', appointment.id]);
  }

  refreshAppointments(): void {
    this.loadAppointments();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
