import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../Models/product.model';
import { PaginatedResult } from '../Models/paginated-result.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly backendUrl = 'http://localhost:5019/api/products';
  constructor(private http: HttpClient) { }
  getProducts(storeId: number | null, categoryId: number | null, page: number, pageSize: number): Observable<PaginatedResult<Product>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (storeId) {
      params = params.set('storeId', storeId.toString());
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }

    return this.http.get<PaginatedResult<Product>>(this.backendUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.backendUrl}/${id}`);
  }

  createProduct(productData: any): Observable<Product> {
    return this.http.post<Product>(this.backendUrl, productData);
  }

  updateProduct(id: number, productData: any): Observable<any> {
    return this.http.put(`${this.backendUrl}/${id}`, productData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${id}`);
  }
}