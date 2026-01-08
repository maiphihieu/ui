import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { CurrencyPipe, CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../Models/product.model';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [DecimalPipe, CommonModule, FormsModule],
  templateUrl: './product-detail-modal.component.html',
  styleUrls: ['./product-detail-modal.component.css']
})
export class ProductDetailModalComponent implements OnInit {
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<{ product: Product, quantity: number, note: string }>();

  quantity: number = 1;
  note: string = '';

  constructor() {}

  ngOnInit(): void {}

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onAddToCart(): void {
    if(this.product) {
      this.addToCart.emit({ product: this.product, quantity: this.quantity, note: this.note });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}