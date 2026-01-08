import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '../../../../../Models/store.model';
import { Category } from '../../../../../Models/category.model';
import { Product } from '../../../../../Models/product.model';
import { StoreService } from '../../../../../Services/store.service';
import { CategoryService } from '../../../../../Services/category.service';
import { ProductService } from '../../../../../Services/product.service';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink,DecimalPipe],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  stores: Store[] = [];
  categories: Category[] = [];
  products: Product[] = [];
  
  selectedStoreId: number | null = null;
  selectedCategoryId: number | null = null;
  
  totalCount = 0;
  currentPage = 1;
  pageSize = 9;

  constructor(
    private storeService: StoreService,
    private categoryService: CategoryService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.storeService.getStores(1, 100).subscribe(result => {
      this.stores = result.items;
    });
    this.loadProducts(1);
  }

  onStoreChange(event: Event): void {
    const storeId = (event.target as HTMLSelectElement).value;
    this.selectedStoreId = storeId ? +storeId : null;
    this.selectedCategoryId = null;
    this.categories = [];

    if (this.selectedStoreId) {
      this.categoryService.getCategories(this.selectedStoreId, 1, 100).subscribe(result => {
        this.categories = result.items;
      });
    }
    this.loadProducts(1);
  }

  onCategoryChange(event: Event): void {
    const categoryId = (event.target as HTMLSelectElement).value;
    this.selectedCategoryId = categoryId ? +categoryId : null;
    this.loadProducts(1);
  }

  loadProducts(page: number): void {
    this.currentPage = page;
    this.productService.getProducts(this.selectedStoreId, this.selectedCategoryId, this.currentPage, this.pageSize).subscribe(result => {
      this.products = result.items;
      this.totalCount = result.totalCount;
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.loadProducts(this.currentPage);
        },
        error: (err) => {
          console.error(err);
          alert('Xóa thất bại! ');
        }
      });
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
}