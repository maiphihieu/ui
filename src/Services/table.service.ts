import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Table } from '../Models/table.model';
import { PaginatedResult } from '../Models/paginated-result.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private readonly backendUrl = 'http://localhost:5019/api/tables';
  constructor(private http: HttpClient) { }
   getTables(storeId: number | null, branchId: number | null, page: number, pageSize: number): Observable<PaginatedResult<Table>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());
      
    if (storeId) {
      params = params.set('storeId', storeId.toString());
    }
    if (branchId) {
      params = params.set('branchId', branchId.toString());
    }
    return this.http.get<PaginatedResult<Table>>(this.backendUrl, { params });
  }

  getTableById(id: number): Observable<Table> {
    return this.http.get<Table>(`${this.backendUrl}/${id}`);
  }

  createTable(data: Partial<Table>): Observable<Table> {
    return this.http.post<Table>(this.backendUrl, data);
  }

  updateTable(id: number, data: Partial<Table>): Observable<any> {
    return this.http.put(`${this.backendUrl}/${id}`, data);
  }
  deleteTable(id:number):Observable<any>{
    return this.http.delete(`${this.backendUrl}/${id}`)
  }
  getTableByToken(token: string): Observable<Table> {
     return this.http.get<Table>(`${this.backendUrl}/by-token/${token}`);
   }
}