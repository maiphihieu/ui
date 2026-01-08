import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Khai báo URL trực tiếp như các file service khác
  private readonly userUrl = 'http://localhost:5019/api/Auth';

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách tất cả người dùng
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.userUrl);
  }

  /**
   * Lấy thông tin chi tiết một người dùng bằng ID
   * (Hàm này bạn có thể cần cho trang Chỉnh sửa)
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.userUrl}/${id}`);
  }

  /**
   * Tạo một người dùng mới (đăng ký)
   * userData phải chứa: username, password, role
   */
 createUser(userData: any): Observable<any> {
  return this.http.post(`${this.userUrl}/register`, userData, { responseType: 'text' });
}

  /**
   * Cập nhật thông tin người dùng (vai trò hoặc mật khẩu)
   * userData có thể chứa: role, password
   */
  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.userUrl}/${id}`, userData);
  }

  /**
   * Xóa một người dùng
   */
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.userUrl}/${id}`);
  }
}