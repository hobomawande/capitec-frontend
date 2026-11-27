
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppointmentService } from '../../../../core/services/appointment';
import { AppointmentResponse } from '../../../../Models/appointment/AppointmentResponse';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  selector: 'app-appointment-confirmation',
  styleUrl: './appointment-confirmation.scss',
  templateUrl: './appointment-confirmation.html',
})
export class AppointmentConfirmation implements OnInit {
  appointment = signal<AppointmentResponse | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Appointment reference not found.');
      this.loading.set(false);
      return;
    }

    this.appointmentService.getAppointmentById(id).subscribe({
      next: (response) => {
        this.appointment.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to retrieve appointment confirmation.');
        this.loading.set(false);
      },
    });
  }
}
