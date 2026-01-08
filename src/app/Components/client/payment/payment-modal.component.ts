import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.css']
})
export class PaymentModalComponent {
  @Input() tableName: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() request = new EventEmitter<string>();

  paymentMethod: string = ''; 

  onRequest(): void {
    if (this.paymentMethod) {
         console.log('BƯỚC 2: Nút "Gửi yêu cầu" trong modal đã được bấm.');
      this.request.emit(this.paymentMethod);
    } else {
      alert('Vui lòng chọn một phương thức thanh toán.');
    }
  }
}