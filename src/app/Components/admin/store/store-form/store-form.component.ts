import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreService } from '../../../../../Services/store.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-store-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './store-form.component.html',
  styleUrls: ['./store-form.component.css']
})
export class StoreFormComponent implements OnInit {
  storeForm: FormGroup;
  isEditMode = false;
  currentId: number | null = null;
  pageTitle = 'Thêm mới Thương hiệu';

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router,
     private location: Location
  ) {
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      imgStore: [''],
      phoneNumber: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.currentId = +id;
      this.pageTitle = 'Chỉnh sửa Thương hiệu';
      this.storeService.getStoreById(this.currentId).subscribe(store => {
        this.storeForm.patchValue(store);
      });
    }
  }

  onSubmit(): void {
    if (this.storeForm.invalid) return;

    const formData = this.storeForm.value;

    if (this.isEditMode && this.currentId) {
      this.storeService.updateStore(this.currentId, formData).subscribe(() => {
        this.router.navigate(['/admin/stores']);
      });
    } else {
      this.storeService.createStore(formData).subscribe(() => {
        this.router.navigate(['/admin/stores']);
      });
    }
  }
    goBack():void{
    this.location.back()
  }
}