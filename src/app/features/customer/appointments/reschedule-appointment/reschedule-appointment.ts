
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AppointmentService } from '../../../../core/services/appointment';
import { AppointmentResponse } from '../../../../Models/appointment/AppointmentResponse';
import { UpdateAppointmentRequest } from '../../../../Models/appointment/UpdateAppointmentRequest';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  selector: 'app-reschedule-appointment',
  styleUrl: './reschedule-appointment.scss',
  templateUrl: './reschedule-appointment.html',
})
export class RescheduleAppointment implements OnInit {
  appointment = signal<AppointmentResponse | null>(null);

  availableSlots = signal<string[]>([]);

  loading = signal(false);
  loadingSlots = signal(false);
  saving = signal(false);

  error = signal('');
  success = signal('');

  appointmentDate: Date | null = null;
  selectedTime = '';
  selectedServiceName = '';

  services: string[] = [
    'Account Opening',
    'Card Services',
    'Account Enquiries',
    'Personal Loan Enquiries',
    'Other Banking Services',
  ];
  appointmentTimes: string[] = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];
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

        if (
          response.status === 'CANCELLED' ||
          response.status === 'COMPLETED' ||
          response.status === 'NO_SHOW'
        ) {
          this.error.set('This appointment cannot be rescheduled.');

          this.loading.set(false);
          return;
        }

        // Convert the saved date into a local Date object.
        const datePart = response.appointmentDate.substring(0, 10);
        const [year, month, day] = datePart.split('-').map(Number);

        this.appointmentDate = new Date(year, month - 1, day);

        this.selectedTime = response.startTime;

        // Preload the existing appointment service.
        this.selectedServiceName = response.reason || '';

        this.loading.set(false);

        this.loadAvailableSlots(true);
      },

      error: () => {
        this.error.set('Unable to load appointment.');
        this.loading.set(false);
      },
    });
  }

  getMinDate(): Date {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  loadAvailableSlots(preserveSelectedTime = false): void {
    const appointment = this.appointment();

    if (!appointment || !this.appointmentDate) {
      this.availableSlots.set([]);
      return;
    }

    const selectedDate = this.formatDate(this.appointmentDate);
    const minimumDate = this.formatDate(this.getMinDate());

    if (selectedDate < minimumDate) {
      this.error.set('Appointment date cannot be in the past.');
      this.availableSlots.set([]);
      this.selectedTime = '';
      return;
    }

    this.error.set('');
    this.loadingSlots.set(true);
    this.availableSlots.set([]);

    if (!preserveSelectedTime) {
      this.selectedTime = '';
    }
    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        let appointmentsList: AppointmentResponse[] = appointments.filter(
          (app) =>
            app.appointmentDate == appointment.appointmentDate &&
            app.status != 'COMPLETED' &&
            app.status != 'CANCELLED',
        );
        for (const appointment of appointmentsList) {
          this.appointmentTimes = this.appointmentTimes.filter(time => time != appointment.startTime.substring(0,5) );
        }
        this.availableSlots.set(this.appointmentTimes);
        this.loading.set(false);
        this.loadingSlots.set(false);
      },

      error: () => {
        this.error.set('Unable to load available time slots. Please try again.');

        this.loadingSlots.set(false);
      },
    });
  }

  saveChanges(): void {
    const appointment = this.appointment();

    if (!appointment || this.saving()) {
      return;
    }

    if (
      appointment.status === 'CANCELLED' ||
      appointment.status === 'COMPLETED' ||
      appointment.status === 'NO_SHOW'
    ) {
      this.error.set('This appointment cannot be rescheduled.');
      return;
    }

    if (!this.appointmentDate || !this.selectedTime || !this.selectedServiceName) {
      this.error.set('Please complete all fields.');
      return;
    }

    const selectedDate = this.formatDate(this.appointmentDate);
    const minimumDate = this.formatDate(this.getMinDate());

    if (selectedDate < minimumDate) {
      this.error.set('Please select a valid appointment date.');
      return;
    }

    if (!this.availableSlots().includes(this.selectedTime)) {
      this.error.set('Please select an available time slot.');
      return;
    }

    const request: UpdateAppointmentRequest = {
      appointmentDate: selectedDate,
      startTime: this.selectedTime,
      serviceName: this.selectedServiceName,
    };

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    this.appointmentService.updateAppointment(appointment.id, request).subscribe({
      next: () => {
        this.saving.set(false);

        this.router.navigate(['/customer/appointments', appointment.id]);
      },

      error: (error) => {
        this.saving.set(false);

        this.error.set(error.error?.message || 'Unable to update appointment. Please try again.');
      },
    });
  }

  goBack(): void {
    const appointment = this.appointment();

    if (appointment) {
      this.router.navigate(['/customer/appointments', appointment.id]);
    } else {
      this.router.navigate(['/customer/appointments']);
    }
  }
}
