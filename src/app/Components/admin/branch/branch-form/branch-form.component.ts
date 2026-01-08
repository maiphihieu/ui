import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '../../../../../Models/store.model';
import { BranchService } from '../../../../../Services/branch.service';
import { StoreService } from '../../../../../Services/store.service';


@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './branch-form.component.html',
  styleUrls: ['./branch-form.component.css']
})
export class BranchFormComponent implements OnInit {
  branchForm: FormGroup;
  isEditMode = false;
  currentId: number | null = null;
  pageTitle = 'Thêm mới Chi nhánh';
  stores: Store[] = []; // Biến để chứa danh sách Store

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private storeService: StoreService, // Inject StoreService
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.branchForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      storeId: [null, Validators.required] // Thêm storeId vào form
    });
  }

  ngOnInit(): void {
    this.loadStores(); // Tải danh sách Store khi component khởi tạo
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.currentId = +id;
      this.pageTitle = 'Chỉnh sửa Chi nhánh';
      this.branchService.getBranchById(this.currentId).subscribe(branch => {
        this.branchForm.patchValue(branch);
      });
    }
  }

  loadStores(): void {
    // Gọi API để lấy danh sách Store cho dropdown
    this.storeService.getStores(1, 100).subscribe(result => {
      this.stores = result.items;
    });
  }

  onSubmit(): void {
    if (this.branchForm.invalid) return;
    console.log('Nút Lưu đã được nhấn!');
    console.log('Giá trị của form:', this.branchForm.value);
    console.log('Trạng thái form hợp lệ:', this.branchForm.valid);

    if (this.branchForm.invalid) {
      console.log('Form không hợp lệ, dừng lại.');
      return;
    }
    
    console.log('Form hợp lệ, đang gọi service...');

    const formData = this.branchForm.value;

    if (this.isEditMode && this.currentId) {
      this.branchService.updateBranch(this.currentId, formData).subscribe(() => {
        this.router.navigate(['/admin/branches']);
      });
    } else {
      this.branchService.createBranch(formData).subscribe(() => {
        this.router.navigate(['/admin/branches']);
      });
    }
  }
  goBack(): void {
        this.location.back();
    }
}