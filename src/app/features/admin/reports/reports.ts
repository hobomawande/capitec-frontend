import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { Chart, registerables } from 'chart.js';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RouterModule } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment';
import { BranchService } from '../../../core/services/branch';

import { AppointmentResponse } from '../../../Models/appointment/AppointmentResponse';
import { Branch } from '../../../Models/branch/Branch';

Chart.register(...registerables);

type ReportPeriod = 'today' | 'week' | 'month' | 'year';

interface BranchPerformance {
  branchName: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
}

@Component({
  standalone: true,
  selector: 'app-reports',
  templateUrl: './reports.html',
  styleUrl: './reports.scss',

  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class Reports implements OnInit, AfterViewInit, OnDestroy {
  // Canvas references
  private appointmentCanvas?: HTMLCanvasElement;
  private statusCanvas?: HTMLCanvasElement;

  @ViewChild('appointmentChart')
  set appointmentChartView(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.appointmentCanvas = ref?.nativeElement;

    if (this.appointmentCanvas && this.viewReady) {
      this.updateAppointmentChart();
    }
  }

  @ViewChild('statusChart')
  set statusChartView(ref: ElementRef<HTMLCanvasElement> | undefined) {
    this.statusCanvas = ref?.nativeElement;

    if (this.statusCanvas && this.viewReady) {
      this.updateStatusChart();
    }
  }
  @ViewChild('appointmentChart', { static: false })
  appointmentChartRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('statusChart', { static: false })
  statusChartRef!: ElementRef<HTMLCanvasElement>;
  selectedPeriod: ReportPeriod = 'month';

  loading = signal(false);
  errorMessage = signal('');

  appointments: AppointmentResponse[] = [];
  branches: Branch[] = [];

  appointmentChart?: Chart;
  statusChart?: Chart;

  private viewReady = false;

  report = {
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    noShowAppointments: 0,
  };

  branchPerformance: BranchPerformance[] = [];

  displayedColumns = ['branch', 'total', 'completed', 'cancelled', 'pending'];

  constructor(
    private appointmentService: AppointmentService,
    private branchService: BranchService,
  ) {}

  // INITIALIZATION

  ngOnInit(): void {
    this.loadReports();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.updateCharts();
  }

  // LOAD BACKEND DATA

  loadReports(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      appointments: this.appointmentService.getAllAppointments(),
      branches: this.branchService.getBranches(),
    }).subscribe({
      next: (result) => {
        this.appointments = result.appointments;
        this.branches = result.branches;

        console.log('Appointments from backend:', this.appointments);

        this.calculateStatistics();
        this.calculateBranchPerformance();

        this.loading.set(false);

        this.updateCharts();
      },

      error: (error) => {
        console.error('Failed to load reports:', error);

        this.errorMessage.set('Unable to load reports. Please try again.');

        this.loading.set(false);
      },
    });
  }

  // STATISTICS

  calculateStatistics(): void {
    const filtered = this.getFilteredAppointments();

    this.report = {
      totalAppointments: filtered.length,

      pendingAppointments: this.countStatus(filtered, 'PENDING'),

      confirmedAppointments: this.countStatus(filtered, 'CONFIRMED'),

      completedAppointments: this.countStatus(filtered, 'COMPLETED'),

      cancelledAppointments: this.countStatus(filtered, 'CANCELLED'),

      noShowAppointments: this.countStatus(filtered, 'NO_SHOW'),
    };

    console.log('Report statistics:', this.report);
  }

  private countStatus(appointments: AppointmentResponse[], status: string): number {
    return appointments.filter((appointment) => appointment.status?.toUpperCase() === status)
      .length;
  }

  // DATE FILTERING

  private getFilteredAppointments(): AppointmentResponse[] {
    const today = this.startOfDay(new Date());

    const start = new Date(today);
    const end = new Date(today);

    switch (this.selectedPeriod) {
      case 'today':
        break;

      case 'week': {
        const day = start.getDay();
        const daysSinceMonday = (day + 6) % 7;

        start.setDate(start.getDate() - daysSinceMonday);

        end.setTime(start.getTime());
        end.setDate(end.getDate() + 6);

        break;
      }

      case 'month':
        start.setDate(1);

        end.setMonth(end.getMonth() + 1, 0);

        break;

      case 'year':
        start.setMonth(0, 1);

        end.setMonth(11, 31);

        break;
    }

    end.setHours(23, 59, 59, 999);

    const filtered = this.appointments.filter((appointment) => {
      const date = this.parseAppointmentDate(appointment.appointmentDate);

      return date !== null && date >= start && date <= end;
    });

    console.log('Filtered appointments:', filtered);

    return filtered;
  }

  private parseAppointmentDate(value: string): Date | null {
    if (!value) return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

    const date = match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    return result;
  }

  // BRANCH PERFORMANCE

  calculateBranchPerformance(): void {
    const filtered = this.getFilteredAppointments();

    this.branchPerformance = this.branches.map((branch) => {
      const branchAppointments = filtered.filter(
        (appointment) => appointment.branchId === branch.id,
      );

      return {
        branchName: branch.branchName,

        totalAppointments: branchAppointments.length,

        completedAppointments: this.countStatus(branchAppointments, 'COMPLETED'),

        cancelledAppointments: this.countStatus(branchAppointments, 'CANCELLED'),

        pendingAppointments: this.countStatus(branchAppointments, 'PENDING'),
      };
    });
  }

  // PERIOD CHANGE

  onPeriodChange(): void {
    this.calculateStatistics();

    this.calculateBranchPerformance();

    this.updateCharts();
  }

  // CLEANUP

  ngOnDestroy(): void {
    this.appointmentChart?.destroy();

    this.statusChart?.destroy();
  }

  private updateCharts(): void {
    if (!this.viewReady) return;

    setTimeout(() => {
      this.updateAppointmentChart();
      this.updateStatusChart();
    });
  }

  private updateAppointmentChart(): void {
    const canvas = this.appointmentChartRef?.nativeElement;

    if (!canvas) return;

    const filtered = this.getFilteredAppointments();

    const grouped = new Map<string, number>();

    filtered.forEach((appointment) => {
      const date = this.parseAppointmentDate(appointment.appointmentDate);

      if (!date) return;

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');

      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    const labels = Array.from(grouped.keys()).sort();

    const values = labels.map((label) => grouped.get(label) || 0);

    if (this.appointmentChart) {
      this.appointmentChart.destroy();
    }

    this.appointmentChart = new Chart(canvas, {
      type: 'line',

      data: {
        labels,

        datasets: [
          {
            label: 'Appointments',
            data: values,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#2563eb',
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
            grid: {
              color: '#edf0f5',
            },
          },

          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  private updateStatusChart(): void {
    const canvas = this.statusChartRef?.nativeElement;

    if (!canvas) return;

    const report = this.report;

    const labels = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];

    const values = [
      report.pendingAppointments,
      report.confirmedAppointments,
      report.completedAppointments,
      report.cancelledAppointments,
      report.noShowAppointments,
    ];

    if (this.statusChart) {
      this.statusChart.destroy();
    }

    this.statusChart = new Chart(canvas, {
      type: 'doughnut',

      data: {
        labels,

        datasets: [
          {
            data: values,

            backgroundColor: ['#f59e0b', '#3b82f6', '#16a34a', '#ef4444', '#94a3b8'],

            borderWidth: 3,
            borderColor: '#ffffff',
            hoverOffset: 8,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        cutout: '68%',

        plugins: {
          legend: {
            position: 'bottom',

            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
        },
      },
    });
  }
}
