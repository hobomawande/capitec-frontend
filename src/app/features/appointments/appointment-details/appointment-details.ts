import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppointmentService } from '../../../core/services/appointment';
import { AppointmentResponse } from '../../../Models/appointment/AppointmentResponse';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.css',
})
export class AppointmentDetailsComponent implements OnInit {
  appointment = signal<AppointmentResponse | null>(null);

  loading = signal(true);
  cancelling = signal(false);
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('Appointment ID was not found.');
      this.loading.set(false);
      return;
    }

    this.loadAppointment(id);
  }

  loadAppointment(id: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.appointmentService.getAppointmentById(id).subscribe({
      next: (response) => {
        this.appointment.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load appointment details.');
        this.loading.set(false);
      },
    });
  }

  cancelAppointment(): void {
    const current = this.appointment();

    if (!current || !confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    this.cancelling.set(true);

    this.appointmentService.cancelAppointment(current.id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.loadAppointment(current.id);
      },
      error: () => {
        this.cancelling.set(false);
        this.errorMessage.set('Unable to cancel appointment. Please try again.');
      },
    });
  }

  canCancel(): boolean {
    const status = this.appointment()?.status;

    return status !== 'CANCELLED' && status !== 'COMPLETED';
  }

  goBack(): void {
    this.router.navigate(['/customer/appointments']);
  }
}
