import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '../../../../../Models/store.model';
import { Branch } from '../../../../../Models/branch.model';
import { TableService } from '../../../../../Services/table.service';
import { StoreService } from '../../../../../Services/store.service';
import { BranchService } from '../../../../../Services/branch.service';

@Component({
  selector: 'app-table-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './table-form.component.html',
  styleUrls: ['./table-form.component.css']
})
export class TableFormComponent implements OnInit {
  tableForm: FormGroup;
  isEditMode = false;
  currentId: number | null = null;
  pageTitle = 'Thêm mới Bàn';
  stores: Store[] = [];
  branches: Branch[] = [];

  constructor(
    private fb: FormBuilder,
    private tableService: TableService,
    private storeService: StoreService,
    private branchService: BranchService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.tableForm = this.fb.group({
      name: ['', Validators.required],
      storeId: [null, Validators.required],
      branchId: [{ value: null, disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStores();
    const id = this.route.snapshot.paramMap.get('id');

    this.tableForm.get('storeId')?.valueChanges.subscribe(storeId => {
      this.tableForm.get('branchId')?.reset();
      this.branches = [];
      if (storeId) {
        this.tableForm.get('branchId')?.enable();
        this.loadBranches(storeId);
      } else {
        this.tableForm.get('branchId')?.disable();
      }
    });

    if (id) {
      this.isEditMode = true;
      this.currentId = +id;
      this.pageTitle = 'Chỉnh sửa Bàn';
      this.tableService.getTableById(this.currentId).subscribe(table => {
        this.tableForm.patchValue(table);
      });
    }
  }

  loadStores(): void {
    this.storeService.getStores(1, 100).subscribe(result => {
      this.stores = result.items;
    });
  }

  loadBranches(storeId: number): void {
    this.branchService.getAllByStoreId(storeId, 1, 100).subscribe(result => {
      this.branches = result.items;
    });
  }

  onSubmit(): void {
    if (this.tableForm.invalid) return;

    const formData = {
      name: this.tableForm.value.name,
      branchId: this.tableForm.value.branchId
    };

    if (this.isEditMode && this.currentId) {
      this.tableService.updateTable(this.currentId, formData).subscribe(() => {
        this.router.navigate(['/admin/tables']);
      });
    } else {
      this.tableService.createTable(formData).subscribe(() => {
        this.router.navigate(['/admin/tables']);
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}