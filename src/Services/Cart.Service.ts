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
  private readonly CART_KEY_PREFIX = 'ipos_o2o_cart_';

  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  constructor() { }

  loadCartForTable(token: string): void {
    const savedCart = localStorage.getItem(this.CART_KEY_PREFIX + token);
    if (savedCart) {
      this.itemsSubject.next(JSON.parse(savedCart));
    } else {
      this.itemsSubject.next([]);
    }
  }

  private saveCart(token: string): void {
    localStorage.setItem(
      this.CART_KEY_PREFIX + token,
      JSON.stringify(this.itemsSubject.getValue())
    );
  }

  addItem(product: Product, token: string): void {
    const currentItems = this.itemsSubject.getValue();
    const existingItem = currentItems.find(
      item => item.product.id === product.id
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      currentItems.push({ product, quantity: 1 });
    }

    this.itemsSubject.next([...currentItems]);
    this.saveCart(token);
  }

  changeQuantity(
    productId: number,
    change: number,
    token: string
  ): void {
    const currentItems = this.itemsSubject.getValue();
    const item = currentItems.find(
      i => i.product.id === productId
    );

    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        this.removeItem(productId, token, false);
      } else {
        this.itemsSubject.next([...currentItems]);
      }
    }

    this.saveCart(token);
  }

  removeItem(
    productId: number,
    token: string,
    shouldSave = true
  ): void {
    const updatedItems = this.itemsSubject
      .getValue()
      .filter(item => item.product.id !== productId);

    this.itemsSubject.next(updatedItems);

    if (shouldSave) {
      this.saveCart(token);
    }
  }

  clearCart(token: string): void {
    this.itemsSubject.next([]);
    localStorage.removeItem(this.CART_KEY_PREFIX + token);
  }

  getCartItems(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  getTotalQuantity(): number {
    return this.getCartItems().reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  getTotalAmount(): number {
    return this.getCartItems().reduce(
      (total, item) =>
        total + item.quantity * item.product.price,
      0
    );
  }
}
