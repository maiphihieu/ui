import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../../Services/user.service';
import { User } from '../../../../../Models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  currentUserId: string | null = null;
  pageTitle = 'Thêm mới Người dùng';
  
  // Định nghĩa các vai trò có sẵn
  roles: string[] = ['Admin', 'Manager', 'Accountant', 'Staff'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.minLength(6)]],
      role: ['Staff', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.route.snapshot.paramMap.get('id');
    if (this.currentUserId) {
      this.isEditMode = true;
      this.pageTitle = 'Chỉnh sửa Người dùng';
      
      // Khi sửa, mật khẩu không bắt buộc
      this.userForm.get('password')?.clearValidators();

      // Lấy thông tin user để điền vào form
      this.userService.getUserById(this.currentUserId).subscribe(user => {
        this.userForm.patchValue({
          username: user.username,
          role: user.role
        });
      });
    } else {
        // Khi thêm mới, mật khẩu là bắt buộc
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }
    const formData = this.userForm.value;
    
    if (this.isEditMode && this.currentUserId) {
      // Chế độ Chỉnh sửa
      this.userService.updateUser(this.currentUserId, formData).subscribe({
          next: () => {
              alert('Cập nhật thành công!');
              this.router.navigate(['/admin/users']);
          },
          error: (err) => {
              // Hiển thị lỗi từ server nếu có
              alert(`Cập nhật thất bại: ${err.error}`);
          }
      });
    } else {
      // Chế độ Thêm mới
      this.userService.createUser(formData).subscribe({
          next: () => {
              alert('Tạo người dùng thành công!');
              this.router.navigate(['/admin/users']);
          },
          error: (err) => {
              // Hiển thị lỗi từ server, ví dụ: "Username already exists."
              alert(`Tạo người dùng thất bại: ${err.error}`);
          }
      });
    }
}

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}