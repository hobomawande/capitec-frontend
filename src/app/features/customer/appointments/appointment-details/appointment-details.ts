
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { AppointmentService } from '../../../../core/services/appointment';
import { AppointmentResponse } from '../../../../Models/appointment/AppointmentResponse';

@Component({
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  selector: 'app-appointment-details',
  styleUrl: './appointment-details.scss',
  templateUrl: './appointment-details.html',
})
export class AppointmentDetails implements OnInit {
  appointment = signal<AppointmentResponse | null>(null);

  loading = signal(true);
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Appointment ID not found';
      this.loading.set(false);
      return;
    }

    this.appointmentService.getAppointmentById(id).subscribe({
      next: (response) => {
        this.appointment.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage = 'Unable to load appointment details';
        this.loading.set(false);
      },
    });
  }

  getTimelineSteps() {
    const status = this.appointment()?.status;

    if (status === 'CANCELLED') {
      return [
        { label: 'Booking Received', completed: true },
        { label: 'Cancelled', completed: true },
      ];
    }

    const stages = ['Booking Received', 'Confirmed', 'Completed'];

    const statusIndex: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 1,
      COMPLETED: 2,
    };

    const currentIndex = statusIndex[status ?? ''] ?? 0;

    return stages.map((label, index) => ({
      label,
      completed: index <= currentIndex,
    }));
  }

  getNotification(): string {
    switch (this.appointment()?.status) {
      case 'PENDING':
        return 'Your appointment booking has been received and is awaiting confirmation.';

      case 'CONFIRMED':
        return 'Great! Your appointment has been confirmed.';

      case 'COMPLETED':
        return 'Your appointment has been successfully completed.';

      case 'CANCELLED':
        return 'This appointment has been cancelled.';

      default:
        return 'Appointment status is currently unavailable.';
    }
  }
}
