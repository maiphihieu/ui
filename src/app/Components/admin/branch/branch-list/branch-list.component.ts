import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '../../../../../Models/store.model';
import { Branch } from '../../../../../Models/branch.model';
import { BranchService } from '../../../../../Services/branch.service';
import { StoreService } from '../../../../../Services/store.service';


@Component({
    selector: 'app-branch-list',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './branch-list.component.html',
    styleUrls: ['./branch-list.component.css']
})
export class BranchListComponent implements OnInit {
    stores: Store[] = [];
    branches: Branch[] = [];

    selectedStoreId: number | null = null;
    totalCount = 0;
    currentPage = 1;
    pageSize = 10;

    constructor(
        private branchService: BranchService,
        private storeService: StoreService,
        
    ) { }

    ngOnInit(): void {
        this.loadFilterData();
        this.loadBranches(1);
    }

    loadFilterData(): void {
        this.storeService.getStores(1, 100).subscribe(result => {
            this.stores = result.items;
        });
    }

    loadBranches(page: number): void {
        this.currentPage = page;
        this.branchService.getBranches(this.selectedStoreId, this.currentPage, this.pageSize).subscribe(result => {
            this.branches = result.items;
            this.totalCount = result.totalCount;
        });
    }

    onFilterChange(event: Event): void {
        const storeId = (event.target as HTMLSelectElement).value;
        this.selectedStoreId = storeId ? +storeId : null;
        this.loadBranches(1);
    }

    get totalPages(): number {
        return Math.ceil(this.totalCount / this.pageSize);
    }

    deleteBranch(id: number): void {
        if (confirm('Bạn có chắc chắn muốn xóa chi nhánh này không?')) {
            this.branchService.deleteBranch(id).subscribe({
                next: () => {
                    alert('Xóa thành công!');
                    this.loadBranches(this.currentPage);
                },
                error: (err) => {
                    console.error(err);
                    alert('Xóa thất bại! chi nhánh có thể đang chứa sản phẩm.');
                }
            });
        }
    }

    
}