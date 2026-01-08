import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../Models/category.model';
import { PaginatedResult } from '../Models/paginated-result.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly backendUrl = 'https://api-ipos.onrender.com/api/categories';

  constructor(private http: HttpClient) { }

  getCategories(
    storeId: number | null,
    page: number,
    pageSize: number
  ): Observable<PaginatedResult<Category>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    if (storeId) {
      params = params.set('storeId', storeId.toString());
    }

    return this.http.get<PaginatedResult<Category>>(
      this.backendUrl,
      { params }
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.backendUrl}/${id}`);
  }

  createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.backendUrl, data);
  }

  updateCategory(id: number, data: Partial<Category>): Observable<any> {
    return this.http.put(`${this.backendUrl}/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${id}`);
  }
}
