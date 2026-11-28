
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../../core/services/auth';
import { RegisterRequest } from '../../../../Models/user/RegisterRequest';
import { StaffService } from '../../../../core/services/staff';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-user-create',
  styleUrl: './user-create.scss',
  templateUrl: './user-create.html',
})
export class UserCreate {
  loading = false;
  errorMessage = '';
  successMessage = '';

  roles = ['ADMIN', 'STAFF', 'CUSTOMER'];

  userForm;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private staff: StaffService,
  ) {
    this.userForm = this.fb.nonNullable.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['CUSTOMER', Validators.required],
    });
  }

  submit(): void {
    if (this.userForm.invalid || this.loading) {
      this.userForm.markAllAsTouched();
      return;
    }

    const request: RegisterRequest = this.userForm.getRawValue();

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.staff.register(request).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'User registered successfully.';

        setTimeout(() => {
          this.router.navigate(['/admin/users']);
        }, 1000);
      },
      error: (error) => {
        this.loading = false;

        this.errorMessage = error.error?.message || 'Unable to register user.';
      },
    });
  }
}
