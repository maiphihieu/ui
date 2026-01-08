import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '../Models/store.model';
import { PaginatedResult } from '../Models/paginated-result.model';
import { Menu } from '../Models/menu.model';


@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly backendUrl = 'http://localhost:5019/api/stores';

  constructor(private http: HttpClient) { }

  getStores(pageNumber: number, pageSize: number): Observable<PaginatedResult<Store>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResult<Store>>(this.backendUrl, { params });
  }

  getFullMenu(storeId: number): Observable<Menu[]> {
  return this.http.get<Menu[]>(`${this.backendUrl}/${storeId}/menu`);
}

  getStoreById(id: number): Observable<Store> {
    return this.http.get<Store>(`${this.backendUrl}/${id}`);
  }

  createStore(data: Partial<Store>): Observable<Store> {
    return this.http.post<Store>(this.backendUrl, data);
  }

  updateStore(id: number, data: Partial<Store>): Observable<any> {
    return this.http.put(`${this.backendUrl}/${id}`, data);
  }

  deleteStore(id: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${id}`);
  }
}