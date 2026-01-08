import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = 'http://localhost:5019/api/Auth';
  private readonly TOKEN_KEY = 'jwt_token';

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: any): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, credentials);
  }

  logout(): void {
    // Xóa token khỏi sessionStorage
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    // Lấy token từ sessionStorage
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    // Kiểm tra token trong sessionStorage
    return !!this.getToken();
  }

  // Hàm này để LoginComponent gọi sau khi đăng nhập thành công
  saveToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }
}