import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '../../../../../Models/store.model';
import { Branch } from '../../../../../Models/branch.model';
import { Table } from '../../../../../Models/table.model';
import { StoreService } from '../../../../../Services/store.service';
import { BranchService } from '../../../../../Services/branch.service';
import { TableService } from '../../../../../Services/table.service';


@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.css']
})
export class TableListComponent implements OnInit {
  stores: Store[] = [];
  branches: Branch[] = [];
  tables: Table[] = [];

  selectedStoreId: number | null = null;
  selectedBranchId: number | null = null;

  totalCount = 0;
  currentPage = 1;
  pageSize = 10;

  constructor(
    private storeService: StoreService,
    private branchService: BranchService,
    private tableService: TableService
  ) {}

  ngOnInit(): void {
    this.storeService.getStores(1, 100).subscribe(result => {
      this.stores = result.items;
    });
    this.loadTables(1);
  }

  onStoreChange(event: Event): void {
    const storeId = (event.target as HTMLSelectElement).value;
    this.selectedStoreId = storeId ? +storeId : null;
    
    this.selectedBranchId = null;
    this.branches = [];

    if (this.selectedStoreId) {
      this.branchService.getAllByStoreId(this.selectedStoreId, 1, 100).subscribe(result => {
        this.branches = result.items;
      });
    }
    this.loadTables(1);
  }

  onBranchChange(event: Event): void {
    const branchId = (event.target as HTMLSelectElement).value;
    this.selectedBranchId = branchId ? +branchId : null;
    this.loadTables(1);
  }

  loadTables(page: number): void {
    this.currentPage = page;
    this.tableService.getTables(this.selectedStoreId, this.selectedBranchId, this.currentPage, this.pageSize).subscribe(result => {
      this.tables = result.items;
      this.totalCount = result.totalCount;
    });
  }

 deleteTable(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa bàn này không?')) {
      this.tableService.deleteTable(id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.loadTables(this.currentPage);
        },
        error: (err) => {
          console.error(err);
          alert('Xóa thất bại! Bàn có thể đang được sử dụng trong một đơn hàng.');
        }
      });
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
}