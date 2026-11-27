import { Component, OnInit, signal } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { AppointmentService } from '../../../core/services/appointment';
import { AuthService } from '../../../core/services/auth';
import { Appointment } from '../../../Models/appointment/Appointment';
import { AppointmentResponse } from '../../../Models/appointment/AppointmentResponse';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatChipsModule, MatIconModule],
  selector: 'app-appointment-list',
  styleUrl: './appointment-list.css',
  templateUrl: './appointment-list.html',
})
export class AppointmentListComponent implements OnInit {
  appointments = signal<AppointmentResponse[]>([]);
  loading = signal(false);
  isAdmin: boolean = false;
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
    this.loadAppointments();
    this.isAdmin = this.auth.hasRole('ADMIN');
  }

  loadAppointments(): void {
    this.loading.set(true);

    const request = this.isAdmin
      ? this.appointmentService.getAllAppointments()
      : this.appointmentService.getMyAppointments();

    request.subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loading.set(false);
      },

      error: () => this.loading.set(false),
    });
  }

  cancelAppointment(appointment: Appointment): void {
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      return;
    }

    this.appointmentService.cancelAppointment(appointment.id).subscribe({
      next: () => this.loadAppointments(),
    });
  }
  viewAppointment(appointment: AppointmentResponse): void {
    this.router.navigate(['/customer/appointments', appointment.id]);
  }
}
