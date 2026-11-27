



import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { StaffService } from '../../../../core/services/staff';
import { StaffResponse } from '../../../../Models/user/StaffResponse';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  selector: 'app-user-management',
  styleUrl: './user-management.scss',
  templateUrl: './user-management.html',
})
export class UserManagement implements OnInit {
  users = signal<StaffResponse[]>([]);

  loading = signal(false);
  updating = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  searchTerm = signal('');
  selectedRole = signal('ALL');
  selectedStatus = signal('ALL');

  // Inline editing
  editingUserId = signal<string | null>(null);
  editingRole = '';

  roles = ['ADMIN', 'STAFF', 'CUSTOMER'];

  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];

  filteredUsers = computed(() => {
    const search = this.searchTerm().toLowerCase();

    return this.users().filter((user) => {
      const matchesSearch =
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesRole = this.selectedRole() === 'ALL' || user.role === this.selectedRole();

      const matchesStatus =
        this.selectedStatus() === 'ALL' ||
        (this.selectedStatus() === 'ACTIVE' && user.enabled) ||
        (this.selectedStatus() === 'INACTIVE' && !user.enabled);

      return matchesSearch && matchesRole && matchesStatus;
    });
  });

  constructor(private staffService: StaffService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.staffService.getAllStaff().subscribe({
      next: (users) => {
        debugger
        this.users.set(users);
        this.loading.set(false);
      },

      error: (error) => {
        this.loading.set(false);

        this.errorMessage.set(error.error?.message || 'Unable to load staff accounts.');
      },
    });
  }

  searchChanged(value: string): void {
    this.searchTerm.set(value);
  }

  roleChanged(value: string): void {
    this.selectedRole.set(value);
  }

  statusChanged(value: string): void {
    this.selectedStatus.set(value);
  }

  // Start editing a user's role
  editUser(user: StaffResponse): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.editingUserId.set(user.id);
    this.editingRole = user.role;
  }

  // Cancel role editing
  cancelEdit(): void {
    this.editingUserId.set(null);
    this.editingRole = '';
  }

  // Save role changes
  saveRole(user: StaffResponse): void {
    if (this.updating()) {
      return;
    }

    if (!this.editingRole) {
      this.errorMessage.set('Please select a role.');
      return;
    }

    if (this.editingRole === user.role) {
      this.cancelEdit();
      return;
    }

    this.updating.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.staffService.updateRole(user.id, this.editingRole).subscribe({
      next: (updated) => {
        this.users.update((users) =>
          users.map((item) => (item.id === updated.id ? updated : item)),
        );

        this.updating.set(false);
        this.cancelEdit();

        this.successMessage.set('User role updated successfully.');
      },

      error: (error) => {
        this.updating.set(false);

        this.errorMessage.set(error.error?.message || 'Unable to update user role.');
      },
    });
  }

  // Activate or deactivate account
  toggleStatus(user: StaffResponse): void {
    if (this.updating()) {
      return;
    }

    const newStatus = !user.enabled;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? 'activate' : 'deactivate'
      } ${user.firstName} ${user.lastName}?`,
    );

    if (!confirmed) {
      return;
    }

    this.updating.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.staffService.updateStatus(user.id, newStatus).subscribe({
      next: (updated) => {
        this.users.update((users) =>
          users.map((item) => (item.id === updated.id ? updated : item)),
        );

        this.updating.set(false);

        this.successMessage.set(`Account ${newStatus ? 'activated' : 'deactivated'} successfully.`);
      },

      error: (error) => {
        this.updating.set(false);

        this.errorMessage.set(error.error?.message || 'Unable to update account status.');
      },
    });
  }
}

