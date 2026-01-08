import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly userUrl = 'https://api-ipos.onrender.com/api/Auth';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.userUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.userUrl}/${id}`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(
      `${this.userUrl}/register`,
      userData,
      { responseType: 'text' }
    );
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.userUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.userUrl}/${id}`);
  }
}
