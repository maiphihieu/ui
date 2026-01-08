import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../Models/paginated-result.model';
import { Order } from '../Models/order.modal';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly backendUrl = 'https://api-ipos.onrender.com/api/orders';

  constructor(private http: HttpClient) { }

  getOrders(
    storeId: number | null,
    branchId: number | null,
    tableId: number | null,
    page: number,
    pageSize: number
  ): Observable<PaginatedResult<Order>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    if (storeId) {
      params = params.set('storeId', storeId.toString());
    }

    if (branchId) {
      params = params.set('branchId', branchId.toString());
    }

    if (tableId) {
      params = params.set('tableId', tableId.toString());
    }

    return this.http.get<PaginatedResult<Order>>(
      this.backendUrl,
      { params }
    );
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.backendUrl}/${orderId}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.patch(
      `${this.backendUrl}/${orderId}/status`,
      { status }
    );
  }

  createOrder(orderData: {
    branchId: number;
    tableInfoId: number;
    orderItems: any[];
  }): Observable<any> {
    return this.http.post(this.backendUrl, orderData);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${id}`);
  }

  requestPayment(
    token: string,
    paymentMethod: string
  ): Observable<any> {
    return this.http.post(
      `${this.backendUrl}/request-payment`,
      { token, paymentMethod }
    );
  }
}
