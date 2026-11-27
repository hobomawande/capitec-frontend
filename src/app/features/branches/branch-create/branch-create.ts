import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { BranchService } from '../../../core/services/branch';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  selector: 'app-branch-create',
  styleUrl: './branch-create.css',
  templateUrl: './branch-create.html',
})
export class BranchCreateComponent {
  loading = false;
  errorMessage = '';

  provinces = [
    'Gauteng',
    'Western Cape',
    'Eastern Cape',
    'KwaZulu-Natal',
    'Free State',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
  ];

  branchForm;

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private router: Router,
  ) {
    this.branchForm = this.fb.nonNullable.group({
      branchName: ['', Validators.required],
      branchCode: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.branchService.createBranch(this.branchForm.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/branches']);
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage = error.error?.message || 'Unable to create branch';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/branches']);
  }
}







