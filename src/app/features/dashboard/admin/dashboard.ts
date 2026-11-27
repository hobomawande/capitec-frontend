
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BranchService } from '../../../core/services/branch';
import { AppointmentService } from '../../../core/services/appointment';
import { AppointmentResponse } from '../../../Models/appointment/AppointmentResponse';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  totalBranches = signal(0);
  activeBranches = signal(0);

  totalAppointments = signal(0);
  upcomingAppointments = signal(0);

  pendingAppointments = signal(0);
  confirmedAppointments = signal(0);
  completedAppointments = signal(0);

  recentAppointments = signal<AppointmentResponse[]>([]);

  loadingBranches = signal(false);
  loadingAppointments = signal(false);

  branchError = signal('');
  appointmentError = signal('');

  today = this.getToday();

  constructor(
    private branchService: BranchService,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loadBranches();
    this.loadAppointments();
  }

  loadBranches(): void {
    this.loadingBranches.set(true);
    this.branchError.set('');

    this.branchService.getActiveBranches().subscribe({
      next: (branches) => {
        this.totalBranches.set(branches.length);

        this.activeBranches.set(branches.filter((branch) => branch.active).length);

        this.loadingBranches.set(false);
      },

      error: () => {
        this.loadingBranches.set(false);
        this.branchError.set('Unable to load branch information.');
      },
    });
  }

  loadAppointments(): void {
    this.loadingAppointments.set(true);
    this.appointmentError.set('');

    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        this.totalAppointments.set(appointments.length);

        this.upcomingAppointments.set(
          appointments.filter(
            (a) =>
              a.appointmentDate >= this.today &&
              !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(a.status.toUpperCase()),
          ).length,
        );

        this.pendingAppointments.set(
          appointments.filter((a) => a.status.toUpperCase() === 'PENDING').length,
        );

        this.confirmedAppointments.set(
          appointments.filter((a) => a.status.toUpperCase() === 'CONFIRMED').length,
        );

        this.completedAppointments.set(
          appointments.filter((a) => a.status.toUpperCase() === 'COMPLETED').length,
        );

        const sorted = [...appointments].sort((a, b) => {
          const dateA = `${a.appointmentDate} ${a.startTime}`;
          const dateB = `${b.appointmentDate} ${b.startTime}`;

          return dateB.localeCompare(dateA);
        });

        this.recentAppointments.set(sorted.slice(0, 5));

        this.loadingAppointments.set(false);
      },

      error: () => {
        this.loadingAppointments.set(false);
        this.appointmentError.set('Unable to load appointment information.');
      },
    });
  }

  getToday(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }
}
