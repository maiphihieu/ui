import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { Store } from '../../../../../Models/store.model';
import { Category } from '../../../../../Models/category.model';
import { ProductService } from '../../../../../Services/product.service';
import { StoreService } from '../../../../../Services/store.service';
import { CategoryService } from '../../../../../Services/category.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  currentId: number | null = null;
  pageTitle = 'Thêm mới Sản phẩm';
  stores: Store[] = [];
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private storeService: StoreService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      imageUrl: [''],
      storeId: [null, Validators.required],
      categoryId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStores();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.currentId = +id;
      this.pageTitle = 'Chỉnh sửa Sản phẩm';
      this.productService.getProductById(this.currentId).subscribe(product => {
        this.productForm.patchValue(product);
        if (product.storeId) {
          this.loadCategories(product.storeId);
        }
      });
    }

    this.productForm.get('storeId')?.valueChanges.subscribe(storeId => {
      if (storeId) {
        this.loadCategories(storeId);
      }
    });
  }

  loadStores(): void {
    this.storeService.getStores(1, 100).subscribe(result => {
      this.stores = result.items;
    });
  }

  loadCategories(storeId: number): void {
    this.categoryService.getCategories(storeId, 1, 100).subscribe(result => {
      this.categories = result.items;
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    const formData = this.productForm.value;

    if (this.isEditMode && this.currentId) {
      this.productService.updateProduct(this.currentId, formData).subscribe(() => {
        this.router.navigate(['/admin/products']);
      });
    } else {
      this.productService.createProduct(formData).subscribe(() => {
        this.router.navigate(['/admin/products']);
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}