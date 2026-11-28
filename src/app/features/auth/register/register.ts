import { Component } from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../../core/services/auth';
import { StaffService } from '../../../core/services/staff';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class RegisterComponent {
  loading = false;

  errorMessage = '';
  successMessage = '';

  hidePassword = true;
  hideConfirmPassword = true;

  registerForm;

  constructor(
    private fb: FormBuilder,
    private staff: StaffService,
    private router: Router,
  ) {
    this.registerForm = this.fb.nonNullable.group(
      {
        fullName: ['', Validators.required],

        email: ['', [Validators.required, Validators.email]],

        role: ['', Validators.required],

        password: ['', [Validators.required, Validators.minLength(8)]],
      },
      {
        validators: passwordMatchValidator,
      },
    );
  }

  submit(): void {
    if (this.loading) {
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();

      this.errorMessage = 'Please complete all required fields correctly.';
      return;
    }

    const formValue = this.registerForm.getRawValue();

    if (formValue.role !== 'STAFF') {
      this.errorMessage = 'Only authorised staff registration is permitted.';
      return;
    }

    const request = {
      fullName: formValue.fullName.trim(),
      email: formValue.email.trim(),
      password: formValue.password,
      role: 'STAFF',
    };

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.staff.register(request).subscribe({
      next: () => {
        this.loading = false;

        this.successMessage = 'Staff account created successfully.';

        this.registerForm.reset({
          fullName: '',
          email: '',
          role: '',
          password: '',
        });

        this.router.navigate(['/login']);
      },

      error: (error: HttpErrorResponse) => {
        this.loading = false;

        this.errorMessage = this.getRegistrationError(error);

        console.error('Registration failed:', error);
      },
    });
  }

  private getRegistrationError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to connect to the server. Check your internet connection.';
    }

    if (error.status === 400) {
      return error.error?.message || 'Invalid registration details. Please check your information.';
    }

    if (error.status === 401) {
      return 'You must be logged in to register a staff account.';
    }

    if (error.status === 403) {
      return 'Access denied. Only authorised administrators can register staff.';
    }

    if (error.status === 409) {
      return 'An account with this email address already exists.';
    }

    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return error.error?.message || 'Registration failed. Please try again.';
  }
}
