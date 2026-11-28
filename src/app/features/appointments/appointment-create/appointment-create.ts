
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { BranchService } from '../../../core/services/branch';
import { AppointmentService } from '../../../core/services/appointment';
import { Branch } from '../../../Models/branch/Branch';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { Appointment } from '../../../Models/appointment/Appointment';
import { AppointmentResponse } from '../../../Models/appointment/AppointmentResponse';

@Component({
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    CommonModule,
  ],
  selector: 'app-appointment-create',
  styleUrl: './appointment-create.css',
  templateUrl: './appointment-create.html',
})
export class AppointmentCreateComponent implements OnInit {
  branches: Branch[] = [];
  filteredBranches: Branch[] = [];
  loading = signal(true);
  errorMessage = signal('');
  availableSlots = signal<string[]>([]);
  error = signal('');
  provinces: string[] = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape',
  ];

  services: string[] = [
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
    private authService: AuthService,
  ) {
    this.bookingForm = this.fb.nonNullable.group({
      province: ['', Validators.required],
      branchId: ['', Validators.required],
      serviceName: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadBranches();

    this.bookingForm.get('appointmentDate')?.valueChanges.subscribe((selectedDate) => {
      if (selectedDate) {
        this.loadAvailableSlots();
      }
    });

  }

  loadBranches(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.branchService.getActiveBranches().subscribe({
      next: (data) => {
        this.branches = data;
        this.loading.set(false);

        const province = this.bookingForm.controls.province.value;

        if (province) {
          this.filteredBranches = this.branches.filter((branch) => branch.province === province);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Unable to load branches.');
      },
    });
  }
  loadAvailableSlots(): void {

    this.appointmentService.getAllAppointments().subscribe({
      next: (response) => {

        const value = this.bookingForm.getRawValue();

        const selectedDate: any = value.appointmentDate;
        const date = selectedDate instanceof Date ? this.formatDate(selectedDate) : selectedDate;
        var appointments: AppointmentResponse[] = response.filter(
          (st) => st.customerId === this.authService.getCurrentUser()?.staffId && date === st.appointmentDate
        );

       let appointmentTimes:string[] = [
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
        appointments.forEach((appointment: AppointmentResponse) => {
          if (
            appointment.status != 'CANCELLED' &&
            appointment.status != 'COMPLETED' &&
            appointment.status != 'NO_SHOW'
          ) {
            console.log(appointment.appointmentDate);
            console.log(appointment.startTime.substring(0, 5));
            appointmentTimes = appointmentTimes.filter( (time) =>
                time != appointment.startTime.substring(0, 5) ,
            );
          }
        });

        this.availableSlots.set(appointmentTimes);
        this.loading.set(false);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Unable to load appointment.');
        this.loading.set(false);
      },
    });
  }
  provinceChanged(): void {
    const province = this.bookingForm.controls.province.value;

    this.filteredBranches = this.branches.filter((branch) => branch.province === province);

    this.bookingForm.controls.branchId.setValue('');
  }

  getMinDate(): Date {
    return new Date();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  submit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    const value = this.bookingForm.getRawValue();

    const selectedDate: any = value.appointmentDate;

    const date = selectedDate instanceof Date ? this.formatDate(selectedDate) : selectedDate;

    this.loading.set(true);
    this.errorMessage.set('');

    const request = {
      branchId: value.branchId,
      serviceName: value.serviceName,
      appointmentDate: date,
      startTime: value.appointmentTime,
      province: value.province,
      customerId: this.authService.getCurrentUser()?.staffId,
    };
    // @ts-ignore
    this.appointmentService.createAppointment(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.router.navigate(['/customer/appointments', response.id]);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Appointment booking failed.');
      },
    });
  }
}
