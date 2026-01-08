import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, AsyncPipe, DecimalPipe } from '@angular/common';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { CartItem, CartService } from '../../../../Services/Cart.Service';
import { OrderService } from '../../../../Services/order.service';
import { TableService } from '../../../../Services/table.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [DecimalPipe, AsyncPipe, RouterLink, ConfirmationModalComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  token: string | null = null;
  tableId: number | null = null;
  branchId: number | null = null;
  isConfirmModalVisible = false;
  confirmMessage = '';
  private actionToConfirm: (() => void) | null = null;

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private tableService: TableService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.cartItems$ = this.cartService.items$;
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (this.token) {
      // Tải giỏ hàng và thông tin bàn
      this.cartService.loadCartForTable(this.token);
      this.tableService.getTableByToken(this.token).subscribe(tableData => {
        this.tableId = tableData.id;
        this.branchId = tableData.branchId;
      });
    }
  }

  // === CẬP NHẬT CÁC HÀM GỌI CART SERVICE ===
  increaseQuantity(item: CartItem): void { 
    if (this.token) this.cartService.changeQuantity(item.product.id, 1, this.token); 
  }
  
  decreaseQuantity(item: CartItem): void { 
    if (this.token) this.cartService.changeQuantity(item.product.id, -1, this.token); 
  }
  
  removeItem(item: CartItem): void {
    if (this.token) {
      this.confirmMessage = `Bạn có chắc muốn loại bỏ sản phẩm ${item.product.name} khỏi giỏ hàng?`;
      this.actionToConfirm = () => this.cartService.removeItem(item.product.id, this.token!);
      this.isConfirmModalVisible = true;
    }
  }

  confirmClearCart(): void {
    if (this.token) {
      this.confirmMessage = 'Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?';
      this.actionToConfirm = () => this.cartService.clearCart(this.token!);
      this.isConfirmModalVisible = true;
    }
  }
  
  handleConfirmation(confirmed: boolean): void {
    if (confirmed && this.actionToConfirm) {
      this.actionToConfirm();
    }
    this.isConfirmModalVisible = false;
    this.actionToConfirm = null;
  }
  
  goBack(): void {
    this.location.back();
  }

  placeOrder(): void {
    if (!this.branchId || !this.tableId || !this.token) {
      alert('Lỗi: Không tìm thấy thông tin bàn hoặc chi nhánh!');
      return;
    }
    const cartItems = this.cartService.getCartItems();
    if (cartItems.length === 0) { return; }
    
    const orderData = {
      branchId: this.branchId,
      tableInfoId: this.tableId,
      orderItems: cartItems.map(item => ({ productId: item.product.id, quantity: item.quantity }))
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (result) => {
        alert(`Đặt hàng thành công! Mã đơn hàng của bạn là #${result.id}`);
        if (this.token) this.cartService.clearCart(this.token);
        this.router.navigate(['/', this.token]);
      },
      error: (err) => {
        console.error(err);
        alert('Đặt hàng thất bại, vui lòng thử lại!');
      }
    });
  }
}