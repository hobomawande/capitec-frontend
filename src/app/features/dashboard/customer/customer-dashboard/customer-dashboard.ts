
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppointmentService } from '../../../../core/services/appointment';
import { AuthService } from '../../../../core/services/auth';
import { Appointment } from '../../../../Models/appointment/Appointment';

@Component({
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  selector: 'app-customer-dashboard',
  styleUrl: './customer-dashboard.css',
  templateUrl: './customer-dashboard.html',
})

export class CustomerDashboardComponent implements OnInit {
  totalAppointments = signal(0);
  upcomingAppointments = signal(0);

  firstName = '';

  constructor(
    private appointmentService: AppointmentService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (appointments) => {
        this.totalAppointments.set(appointments.length);

        const today = new Date().toISOString().slice(0, 10);
        this.firstName = this.auth.getCurrentUser()?.firstName ?? 'Customer';

        this.upcomingAppointments.set(
          appointments.filter(
            (a) =>
              a.appointmentDate >= today && a.status !== 'CANCELLED' && a.status !== 'COMPLETED',
          ).length,
        );
      },
    });
  }

  viewAppointment(appointment: Appointment): void {
    this.router.navigate(['/customer/appointments', appointment.id]);
  }
}
