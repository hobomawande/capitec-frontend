
import { Component, OnInit } from '@angular/core';
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
  ],
  selector: 'app-appointment-create',
  styleUrl: './appointment-create.css',
  templateUrl: './appointment-create.html',
})
export class AppointmentCreateComponent implements OnInit {
  branches: Branch[] = [];
  filteredBranches: Branch[] = [];

  loading = false;
  errorMessage = '';

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

  bookingForm;

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private appointmentService: AppointmentService,
    private router: Router,
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
  }

  loadBranches(): void {
    this.loading = true;
    this.errorMessage = '';

    this.branchService.getActiveBranches().subscribe({
      next: (data) => {
        this.branches = data;
        this.loading = false;

        const province = this.bookingForm.controls.province.value;

        if (province) {
          this.filteredBranches = this.branches.filter((branch) => branch.province === province);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Unable to load branches.';
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

    const selectedDate:any = value.appointmentDate;

    const date = selectedDate instanceof Date ? this.formatDate(selectedDate) : selectedDate;

    this.loading = true;
    this.errorMessage = '';

    const request = {
      branchId: value.branchId,
      serviceName: value.serviceName,
      appointmentDate: date,
      startTime: value.appointmentTime,
      province: value.province,
      customerId: '',
    };

    this.appointmentService.createAppointment(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/customer/appointments', response.id]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Appointment booking failed.';
      },
    });
  }
}
