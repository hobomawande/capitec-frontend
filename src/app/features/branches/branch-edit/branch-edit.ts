import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

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
  ],
  selector: 'app-branch-edit',
  styleUrl: './branch-edit.css',
  templateUrl: './branch-edit.html',
})
export class BranchEditComponent implements OnInit {
  id = '';
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

  form;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private branchService: BranchService,
  ) {
    this.form = this.fb.nonNullable.group({
      branchName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      province: ['', Validators.required],
      postalCode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.id) {
      this.cancel();
      return;
    }

    this.branchService.getBranch(this.id).subscribe({
      next: (branch) =>
        this.form.patchValue({
          branchName: branch.branchName,
          address: branch.address,
          city: branch.city,
          province: branch.province,
          postalCode: branch.postalCode,
        }),
      error: () => {
        this.errorMessage = 'Unable to load branch';
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.branchService.updateBranch(this.id, this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.cancel();
      },

      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Unable to update branch';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/branches']);
  }
}
