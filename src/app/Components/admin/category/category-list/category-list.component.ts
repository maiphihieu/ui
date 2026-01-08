import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '../../../../../Models/store.model';
import { Category } from '../../../../../Models/category.model';
import { CategoryService } from '../../../../../Services/category.service';
import { StoreService } from '../../../../../Services/store.service';


@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  stores: Store[] = [];
  categories: Category[] = [];
  
  selectedStoreId: number | null = null;
  totalCount = 0;
  currentPage = 1;
  pageSize = 9;

  constructor(
    private categoryService: CategoryService,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    this.loadStoresForFilter();
    this.loadCategories(1);
  }

  loadStoresForFilter(): void {
    this.storeService.getStores(1, 100).subscribe(result => {
      this.stores = result.items;
    });
  }

  onStoreFilterChange(event: Event): void {
    const storeId = (event.target as HTMLSelectElement).value;
    this.selectedStoreId = storeId ? +storeId : null;
    this.loadCategories(1);
  }

  loadCategories(page: number): void {
    this.currentPage = page;
    this.categoryService.getCategories(this.selectedStoreId, this.currentPage, this.pageSize).subscribe(result => {
      this.categories = result.items;
      this.totalCount = result.totalCount;
    });
  }

  deleteCategory(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.loadCategories(this.currentPage);
        },
        error: (err) => {
          console.error(err);
          alert('Xóa thất bại! Danh mục có thể đang chứa sản phẩm.');
        }
      });
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
}