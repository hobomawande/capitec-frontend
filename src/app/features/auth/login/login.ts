import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class LoginComponent {
  loading = signal(false);
  errorMessage = signal('');
  hidePassword = true;

  loginForm;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        debugger
        this.loading.set(false);

        if (!response || !response.role) {
          this.errorMessage.set('Invalid login response. Please contact support.');
          return;
        }

        const role = response.role.toUpperCase();

        switch (role) {
          case 'ADMIN':
            this.router.navigate(['/admin/dashboard']);
            break;

          case 'STAFF':
            this.router.navigate(['/admin/dashboard']);
            break;

          case 'CUSTOMER':
            this.router.navigate(['/customer/dashboard']);
            break;

          default:
            this.auth.logout();
            this.errorMessage.set(
              'Your account does not have an authorised role. Please contact support.',
            );
            break;
        }
      },

      error: (error: HttpErrorResponse) => {
        debugger
        this.loading.set(false);

        if (error.status === 0) {
          this.errorMessage.set('Unable to connect to the server. Please try again.');
        } else if (error.status === 401) {
          this.errorMessage.set('Incorrect email or password.');
        } else {
          this.errorMessage.set(error.error?.message || 'Login failed. Please try again.');
        }
      },
    });
  }
}
