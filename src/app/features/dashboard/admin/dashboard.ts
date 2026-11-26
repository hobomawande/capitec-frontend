import { Component, OnInit, signal } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { BranchService } from '../../../core/services/branch';
import { AppointmentService } from '../../../core/services/appointment';

@Component({
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  totalBranches = signal(0);
  activeBranches = signal(0);
  totalAppointments = signal(0);
  upcomingAppointments = signal(0);

  constructor(
    private branchService: BranchService,
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    this.branchService.getActiveBranches().subscribe({
      next: (branches) => {
        this.totalBranches.set(branches.length);
        this.activeBranches.set(branches.filter((branch) => branch.active).length);
      },
    });

    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        this.totalAppointments.set(appointments.length);

        const today = new Date().toISOString().slice(0, 10);

        this.upcomingAppointments.set(
          appointments.filter(
            (a) =>
              a.appointmentDate >= today && a.status !== 'CANCELLED' && a.status !== 'COMPLETED',
          ).length,
        );
      },
    });
  }
}
