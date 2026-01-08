import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '../../../../../Models/store.model';
import { CategoryService } from '../../../../../Services/category.service';
import { StoreService } from '../../../../../Services/store.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;
  currentId: number | null = null;
  pageTitle = 'Thêm mới Danh mục';
  stores: Store[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      logoUrl: [''],
      storeId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStores();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.currentId = +id;
      this.pageTitle = 'Chỉnh sửa Danh mục';
      this.categoryService.getCategoryById(this.currentId).subscribe(cat => {
        this.categoryForm.patchValue(cat);
      });
    }
  }

  loadStores(): void {
    this.storeService.getStores(1, 100).subscribe(result => {
      this.stores = result.items;
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    const formData = this.categoryForm.value;

    if (this.isEditMode && this.currentId) {
      this.categoryService.updateCategory(this.currentId, formData).subscribe(() => {
        this.router.navigate(['/admin/categories']);
      });
    } else {
      this.categoryService.createCategory(formData).subscribe(() => {
        this.router.navigate(['/admin/categories']);
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}