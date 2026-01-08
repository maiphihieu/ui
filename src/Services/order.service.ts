import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../Models/paginated-result.model';
import { Order } from '../Models/order.modal';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Giữ lại cách khai báo URL của bạn, trỏ đến /api/orders
  private readonly backendUrl = 'http://localhost:5019/api/orders';

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách đơn hàng, có thể lọc theo storeId và branchId
   */
  getOrders(storeId: number | null, branchId: number | null,tableId: number | null, page: number, pageSize: number): Observable<PaginatedResult<Order>> {
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

    return this.http.get<PaginatedResult<Order>>(this.backendUrl, { params });
  }

  /**
   * Lấy chi tiết một đơn hàng bằng ID của nó
   */
  getOrderById(orderId: number): Observable<Order> {
    const url = `${this.backendUrl}/${orderId}`;
    return this.http.get<Order>(url);
  }

  /**
   * Cập nhật trạng thái của một đơn hàng
   */
  updateOrderStatus(orderId: number, status: string): Observable<any> {
    const url = `${this.backendUrl}/${orderId}/status`;
    return this.http.patch(url, { status });
  }

  /**
   * Tạo một đơn hàng mới.
   * DTO (orderData) bây giờ phải chứa cả branchId.
   */
  createOrder(orderData: { branchId: number, tableInfoId: number, orderItems: any[] }): Observable<any> {
    // Luôn POST đến /api/orders, không cần xây dựng URL động ở đây nữa
    return this.http.post(this.backendUrl, orderData);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${id}`);
  }

 requestPayment(token: string, paymentMethod: string): Observable<any> {
  const url = `http://localhost:5019/api/orders/request-payment`;
  return this.http.post(url, { token, paymentMethod }); // Gửi token thay vì tableName
}
}