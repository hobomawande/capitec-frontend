import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { BranchService } from '../../../core/services/branch';
import { Branch } from '../../../Models/branch/Branch';

@Component({
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  selector: 'app-branch-list',
  styleUrl: './branch-list.css',
  templateUrl: './branch-list.html',
})
export class BranchListComponent implements OnInit {
  branches = signal<Branch[]>([]);
  loading = signal(false);

  displayedColumns = ['branchCode', 'branchName', 'city', 'province', 'status', 'actions'];

  constructor(
    private branchService: BranchService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.loading.set(true);

    this.branchService.getActiveBranches().subscribe({
      next: (data) => {
        this.branches.set(data);
        this.loading.set(false);
      },

      error: () => {
        this.loading.set(false);
      },
    });
  }

  createBranch(): void {
    this.router.navigate(['/admin/branches/create']);
  }

  editBranch(branch: Branch): void {
    this.router.navigate(['/admin/branches', branch.id, 'edit']);
  }

  toggleStatus(branch: Branch): void {
    const action = branch.active
      ? this.branchService.deactivateBranch(branch.id)
      : this.branchService.activateBranch(branch.id);

    action.subscribe({
      next: () => this.loadBranches(),
    });
  }
}
