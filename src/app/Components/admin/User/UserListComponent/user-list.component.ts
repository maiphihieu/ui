import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../../Services/user.service';
import { User } from '../../../../../Models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
   users: User[] = [];
  isLoading = true;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    // Gọi hàm tải danh sách khi component khởi tạo
    this.loadUsers();
  }

  // --- HÀM MỚI ĐỂ TẢI DANH SÁCH USER ---
  loadUsers(): void {
    this.isLoading = true; // Bật trạng thái loading
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Failed to load users", err);
        this.isLoading = false;
        if (err.status === 403) { // Forbidden
            alert('Bạn không có quyền truy cập chức năng này!');
        }
      }
    });
  }

  // --- HÀM MỚI CHO CHỨC NĂNG XÓA ---
  deleteUser(user: User): void {
    // 1. Hiển thị hộp thoại xác nhận
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.username}" không?`)) {
      // 2. Nếu người dùng đồng ý, gọi service
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          // 3. Khi xóa thành công, thông báo và tải lại danh sách
          alert('Xóa người dùng thành công!');
          this.loadUsers(); // Tải lại danh sách để cập nhật giao diện
        },
        error: (err) => {
          // 4. Nếu có lỗi, hiển thị thông báo
          console.error("Failed to delete user", err);
          // Hiển thị thông báo lỗi từ server, ví dụ: "Admin cannot delete their own account."
          alert(`Xóa thất bại: ${err.error}`); 
        }
      });
    }
  }
}