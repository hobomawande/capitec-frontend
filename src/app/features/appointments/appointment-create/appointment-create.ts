import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BranchService } from '../../../core/services/branch';
import { AppointmentService } from '../../../core/services/appointment';
import { Branch } from '../../../Models/branch/Branch';
import { AvailableSlot } from '../../../Models/appointment/AvailableSlot';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-appointment-create',
  styleUrl: './appointment-create.css',
  templateUrl: './appointment-create.html',
})
export class AppointmentCreateComponent implements OnInit {
  branches: Branch[] = [];
  availableSlots: AvailableSlot[] = [];

  loading = false;
  loadingSlots = false;
  errorMessage = '';

  services = [
    'Account Opening',
    'Card Services',
    'Account Enquiries',
    'Personal Loan Enquiries',
    'Other Banking Services',
  ];

  bookingForm;

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private appointmentService: AppointmentService,
    private router: Router,
  ) {
    this.bookingForm = this.fb.nonNullable.group({
      branchId: ['', Validators.required],
      serviceName: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.branchService.getActiveBranches().subscribe({
      next: (data) => (this.branches = data),
      error: () => {
        this.errorMessage = 'Unable to load branches';
      },
    });
  }

  getMinDate(): Date {
    return new Date();
  }

  dateChanged(): void {
    this.bookingForm.controls.appointmentTime.setValue('');
    this.availableSlots = [];

    const branchId = this.bookingForm.controls.branchId.value;
    const selectedDate:any = this.bookingForm.controls.appointmentDate.value;

    if (!branchId || !selectedDate) return;

    const date = selectedDate instanceof Date ? this.formatDate(selectedDate) : selectedDate;

    this.loadingSlots = true;

    this.appointmentService.getAvailableSlots(branchId, date).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.loadingSlots = false;
      },
      error: () => {
        this.loadingSlots = false;
        this.errorMessage = 'Unable to retrieve available slots';
      },
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  submit(): void {
    if (this.loading) return;

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const value:any = this.bookingForm.getRawValue();

    const date =
      value.appointmentDate instanceof Date
        ? this.formatDate(value.appointmentDate)
        : value.appointmentDate;

    this.loading = true;
    this.errorMessage = '';

    this.appointmentService
      .createAppointment({
        ...value,
        appointmentDate: date,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;

          this.router.navigate(['/customer/appointments', response.id, 'confirmation']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Appointment booking failed';
        },
      });
  }
}
