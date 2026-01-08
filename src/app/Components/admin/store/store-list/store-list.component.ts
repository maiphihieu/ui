import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '../../../../../Models/store.model';
import { StoreService } from '../../../../../Services/store.service';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css']
})
export class StoreListComponent implements OnInit {
  stores: Store[] = [];
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;

  constructor(
    private storeService: StoreService,
    
) {}

  ngOnInit(): void {
    this.loadStores(this.currentPage);
  }

  loadStores(page: number): void {
    this.currentPage = page;
    this.storeService.getStores(this.currentPage, this.pageSize).subscribe(result => {
      this.stores = result.items;
      this.totalCount = result.totalCount;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  deleteStore(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa thương hiệu này không?')) {
      this.storeService.deleteStore(id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.loadStores(this.currentPage); 
        },
        error: (err) => {
          console.error(err);
          alert('Xóa thất bại! Thương hiệu có thể đang chứa chi nhánh hoặc sản phẩm.');
        }
      });
    }
  }


}