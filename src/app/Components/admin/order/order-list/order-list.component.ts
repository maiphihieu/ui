import { Component, NgZone, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Store } from '../../../../../Models/store.model';
import { Branch } from '../../../../../Models/branch.model';
import { Order } from '../../../../../Models/order.modal';
import { StoreService } from '../../../../../Services/store.service';
import { BranchService } from '../../../../../Services/branch.service';
import { OrderService } from '../../../../../Services/order.service';
import { SignalrService } from '../../../../../Services/signalr.service';
import { ToastrService } from 'ngx-toastr';
import { TableService } from '../../../../../Services/table.service';
import { Table } from '../../../../../Models/table.model';



@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  stores: Store[] = [];
  branches: Branch[] = [];
  orders: Order[] = [];
  tablesForFilter: Table[] = [];

  selectedStoreId: number | null = null;
  selectedBranchId: number | null = null;
  selectedTableId: number | null = null;
  expandedOrderId: number | null = null;
  totalCount = 0;
  currentPage = 1;
  pageSize = 15;
  public paymentRequestId: number | null = null;
  public newOrderId: number | null = null;

  constructor(
    private storeService: StoreService,
    private branchService: BranchService,
    private tableService: TableService,
    private orderService: OrderService,
    private signalrService: SignalrService,
    private toastr: ToastrService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.storeService.getStores(1, 100).subscribe(result => {
      this.stores = result.items;
    });
    this.loadOrders(1);
    this.signalrService.addReceiveOrderNotificationListener((data: { message: string, orderId: number }) => {
      // 1. Hiển thị thông báo
      this.zone.run(() => {
        this.toastr.success(data.message, 'Đơn hàng mới!');
        console.log('Đã gọi toastr success (trong Zone)');
        // 2. Lưu lại ID của đơn hàng mới để tô màu
        this.newOrderId = data.orderId;

        // 3. Tải lại danh sách
        this.loadOrders(this.currentPage);

      });

    });

    this.signalrService.addReceivePaymentRequestListener((data: { message: string, orderId: number }) => {
      // 1. Hiển thị thông báo Toastr màu khác
      this.zone.run(() => {

        this.toastr.info(data.message, 'Yêu cầu thanh toán!', {
          timeOut: 15000, // Để thông báo hiển thị lâu hơn
          closeButton: true
        });
        this.paymentRequestId = data.orderId;
      });



    });
  }

  onStoreChange(event: Event): void {
    const storeId = (event.target as HTMLSelectElement).value;
    this.selectedStoreId = storeId ? +storeId : null;
    this.selectedBranchId = null;
    this.selectedTableId = null;
    this.branches = [];
    this.tablesForFilter = [];
    this.orders = [];
    this.totalCount = 0;

    if (this.selectedStoreId) {
      this.branchService.getAllByStoreId(this.selectedStoreId, 1, 100).subscribe(result => {
        this.branches = result.items;
      });
    }
    this.loadOrders(1);
  }

  onBranchChange(event: Event): void {
    const branchId = (event.target as HTMLSelectElement).value;
    this.selectedBranchId = branchId ? +branchId : null;

    // Reset filter bàn
    this.selectedTableId = null;
    this.tablesForFilter = [];

    if (this.selectedBranchId) {
      // Gọi service để lấy danh sách bàn cho chi nhánh này
      // Lấy nhiều bàn (ví dụ: 1000) để không cần phân trang filter
      this.tableService.getTables(null, this.selectedBranchId, 1, 1000).subscribe(result => {
        this.tablesForFilter = result.items;
      });
    }

    this.loadOrders(1); // Load lại đơn hàng theo chi nhánh mới
  }

  onTableChange(event: Event): void {
    const tableId = (event.target as HTMLSelectElement).value;
    this.selectedTableId = tableId ? +tableId : null;
    this.loadOrders(1); // Load lại đơn hàng theo bàn mới
  }

  // === 7. SỬA HÀM loadOrders ĐỂ THÊM tableId ===
  

 loadOrders(page: number): void {
    this.currentPage = page;
    this.orderService.getOrders(
      this.selectedStoreId,
      this.selectedBranchId,
      this.selectedTableId,
      this.currentPage,
      this.pageSize
    ).subscribe(result => {
      this.orders = result.items;
      this.totalCount = result.totalCount;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  toggleDetails(orderId: number): void {
    if (this.expandedOrderId === orderId) {
      // Nếu bấm vào đơn hàng đang mở, thì đóng nó lại
      this.expandedOrderId = null;
    } else {
      // Nếu bấm vào đơn hàng khác, thì mở nó ra
      this.expandedOrderId = orderId;
    }
  }

  deleteOrder(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa chi nhánh này không?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.loadOrders(this.currentPage);
        },
        error: (err) => {
          console.error(err);
          alert('Xóa thất bại');
        }
      });
    }
  }

  completeOrder(order: Order): void {
    if (confirm(`Bạn có chắc chắn muốn hoàn thành đơn hàng #${order.id} không?`)) {
      this.orderService.updateOrderStatus(order.id, 'Completed').subscribe({
        next: () => {
          this.toastr.success(`Đã hoàn thành đơn hàng #${order.id}`, 'Thành công!');

          if (this.newOrderId === order.id) {
            this.newOrderId = null;
          }
          if (this.paymentRequestId === order.id) {
            this.paymentRequestId = null;
          }

          this.loadOrders(this.currentPage);
        },
        error: (err) => {
          this.toastr.error('Cập nhật trạng thái thất bại, vui lòng thử lại.', 'Lỗi!');
          console.error(err);
        }
      });
    }
  }
}