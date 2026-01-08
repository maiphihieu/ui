import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../Models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Tiền tố cho key trong localStorage, ví dụ: 'ipos_o2o_cart_xyz-abc-123'
  private readonly CART_KEY_PREFIX = 'ipos_o2o_cart_';
  
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  constructor() { }

  /**
   * Tải giỏ hàng cho một bàn cụ thể dựa vào token.
   * Hàm này phải được gọi từ component (ví dụ: HomeComponent, MenuComponent) khi khởi tạo.
   */
  loadCartForTable(token: string): void {
    const savedCart = localStorage.getItem(this.CART_KEY_PREFIX + token);
    if (savedCart) {
      this.itemsSubject.next(JSON.parse(savedCart));
    } else {
      // Nếu không có giỏ hàng cũ cho bàn này, bắt đầu với giỏ hàng trống
      this.itemsSubject.next([]);
    }
  }

  /**
   * Hàm nội bộ để lưu giỏ hàng cho một bàn cụ thể.
   */
  private saveCart(token: string): void {
    localStorage.setItem(this.CART_KEY_PREFIX + token, JSON.stringify(this.itemsSubject.getValue()));
  }

  /**
   * Thêm một sản phẩm vào giỏ hàng của bàn hiện tại.
   */
  addItem(product: Product, token: string): void {
    const currentItems = this.itemsSubject.getValue();
    const existingItem = currentItems.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      currentItems.push({ product: product, quantity: 1 });
    }
    this.itemsSubject.next([...currentItems]);
    this.saveCart(token);
  }

  /**
   * Thay đổi số lượng sản phẩm trong giỏ hàng của bàn hiện tại.
   */
  changeQuantity(productId: number, change: number, token: string): void {
    const currentItems = this.itemsSubject.getValue();
    const item = currentItems.find(i => i.product.id === productId);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        // Gọi removeItem nhưng không lưu lại 2 lần
        this.removeItem(productId, token, false); 
      } else {
        this.itemsSubject.next([...currentItems]);
      }
    }
    this.saveCart(token);
  }

  /**
   * Xóa một sản phẩm khỏi giỏ hàng của bàn hiện tại.
   */
  removeItem(productId: number, token: string, shouldSave = true): void {
    const currentItems = this.itemsSubject.getValue();
    const updatedItems = currentItems.filter(item => item.product.id !== productId);
    this.itemsSubject.next(updatedItems);
    if (shouldSave) {
        this.saveCart(token);
    }
  }

  /**
   * Xóa toàn bộ giỏ hàng của bàn hiện tại.
   */
  clearCart(token: string): void {
    this.itemsSubject.next([]);
    localStorage.removeItem(this.CART_KEY_PREFIX + token);
  }

  // Các hàm get không cần thay đổi
  getCartItems(): CartItem[] { return this.itemsSubject.getValue(); }
  getTotalQuantity(): number { return this.getCartItems().reduce((total, item) => total + item.quantity, 0); }
  getTotalAmount(): number { return this.getCartItems().reduce((total, item) => total + (item.quantity * item.product.price), 0); }
}