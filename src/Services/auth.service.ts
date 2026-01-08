import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = 'https://api-ipos.onrender.com/api/Auth';
  private readonly TOKEN_KEY = 'jwt_token';

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: any): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.authUrl}/login`,
      credentials
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  saveToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }
}
