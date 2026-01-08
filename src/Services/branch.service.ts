import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../Models/paginated-result.model';
import { Branch } from '../Models/branch.model';

@Injectable({
    providedIn: 'root'
})
export class BranchService {
    private readonly backendUrl = 'https://api-ipos.onrender.com/api/branches';

    constructor(private http: HttpClient) { }

    getBranches(
        storeId: number | null,
        pageNumber: number,
        pageSize: number
    ): Observable<PaginatedResult<Branch>> {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        if (storeId) {
            params = params.set('storeId', storeId.toString());
        }

        return this.http.get<PaginatedResult<Branch>>(this.backendUrl, { params });
    }

    getAllByStoreId(
        storeId: number,
        page: number,
        pageSize: number
    ): Observable<PaginatedResult<Branch>> {
        const params = new HttpParams()
            .set('storeId', storeId.toString())
            .set('pageNumber', page.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<PaginatedResult<Branch>>(this.backendUrl, { params });
    }

    getBranchById(id: number): Observable<Branch> {
        return this.http.get<Branch>(`${this.backendUrl}/${id}`);
    }

    createBranch(data: Partial<Branch>): Observable<Branch> {
        return this.http.post<Branch>(this.backendUrl, data);
    }

    updateBranch(id: number, data: Partial<Branch>): Observable<any> {
        return this.http.put(`${this.backendUrl}/${id}`, data);
    }

    deleteBranch(id: number): Observable<any> {
        return this.http.delete(`${this.backendUrl}/${id}`);
    }
}
