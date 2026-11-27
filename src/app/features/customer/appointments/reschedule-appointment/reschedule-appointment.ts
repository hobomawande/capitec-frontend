
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { AppointmentService } from '../../../../core/services/appointment';
import { AppointmentResponse } from '../../../../Models/appointment/AppointmentResponse';
import { AvailableSlot } from '../../../../Models/appointment/AvailableSlot';
import { UpdateAppointmentRequest } from '../../../../Models/appointment/UpdateAppointmentRequest';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  selector: 'app-reschedule-appointment',
  styleUrl: './reschedule-appointment.scss',
  templateUrl: './reschedule-appointment.html',
})
export class RescheduleAppointment implements OnInit {
  appointment = signal<AppointmentResponse | null>(null);
  availableSlots = signal<AvailableSlot[]>([]);

  loading = signal(false);
  saving = signal(false);
  error = signal('');

  appointmentDate = '';
  selectedTime = '';
  reason = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Appointment ID not found.');
      return;
    }

    this.loading.set(true);

    this.appointmentService.getAppointmentById(id).subscribe({
      next: (response) => {
        this.appointment.set(response);

        this.appointmentDate = response.appointmentDate;
        this.selectedTime = response.startTime;
        this.reason = response.reason;

        this.loading.set(false);
        this.loadAvailableSlots();
      },
      error: () => {
        this.error.set('Unable to load appointment.');
        this.loading.set(false);
      },
    });
  }

  loadAvailableSlots(): void {
    const appointment = this.appointment();

    if (!appointment || !this.appointmentDate) return;

    this.loading.set(true);
    this.selectedTime = '';

    this.appointmentService
      .getAvailableSlots(appointment.branchId, this.appointmentDate)
      .subscribe({
        next: (slots) => {
          this.availableSlots.set(slots);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Unable to load available time slots.');
          this.loading.set(false);
        },
      });
  }

  saveChanges(): void {
    const appointment = this.appointment();

    if (!appointment || !this.appointmentDate || !this.selectedTime || !this.reason.trim()) {
      this.error.set('Please complete all fields.');
      return;
    }

    const request: UpdateAppointmentRequest = {
      appointmentDate: this.appointmentDate,
      startTime: this.selectedTime,
      reason: this.reason,
    };

    this.saving.set(true);
    this.error.set('');

    this.appointmentService.updateAppointment(appointment.id, request).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/customer/appointments', appointment.id]);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Unable to update appointment. Please try again.');
      },
    });
  }
}
