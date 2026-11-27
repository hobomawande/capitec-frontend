

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { StaffService } from '../../../../core/services/staff';
import { StaffResponse } from '../../../../Models/user/StaffResponse';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  selector: 'app-user-edit',
  styleUrl: './user-edit.scss',
  templateUrl: './user-edit.html',
})
export class UserEdit implements OnInit {
  user = signal<StaffResponse | null>(null);

  loading = signal(false);
  saving = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  roles = ['ADMIN', 'STAFF'];

  userForm;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private staffService: StaffService,
  ) {
    this.userForm = this.fb.nonNullable.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      enabled: [true],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('User ID was not provided.');
      return;
    }

    this.loadUser(id);
  }

  loadUser(id: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.staffService.getStaffById(id).subscribe({
      next: (response) => {
        this.user.set(response);

        this.userForm.patchValue({
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          role: response.role,
          enabled: response.enabled,
        });

        this.loading.set(false);
      },

      error: (error) => {
        this.loading.set(false);

        this.errorMessage.set(error.error?.message || 'Unable to load user details.');
      },
    });
  }

  saveChanges(): void {
    const currentUser = this.user();

    if (!currentUser || this.saving()) {
      return;
    }

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const value = this.userForm.getRawValue();

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const roleChanged = value.role !== currentUser.role;
    const statusChanged = value.enabled !== currentUser.enabled;

    // Update role first, then account status if necessary.
    const updateRole = () => {
      if (!roleChanged) {
        updateStatus();
        return;
      }

      this.staffService.updateRole(currentUser.id, value.role).subscribe({
        next: (updated) => {
          this.user.set(updated);
          updateStatus();
        },

        error: (error) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.message || 'Unable to update user role.');
        },
      });
    };

    const updateStatus = () => {
      if (!statusChanged) {
        finish();
        return;
      }

      this.staffService.updateStatus(currentUser.id, value.enabled).subscribe({
        next: (updated) => {
          this.user.set(updated);
          finish();
        },

        error: (error) => {
          this.saving.set(false);
          this.errorMessage.set(error.error?.message || 'Unable to update account status.');
        },
      });
    };

    const finish = () => {
      this.saving.set(false);

      this.successMessage.set('User account updated successfully.');

      this.loadUser(currentUser.id);
    };

    // Name and email are currently read-only until the backend
    // provides an endpoint for updating those properties.
    updateRole();
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}

