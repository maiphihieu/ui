import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-call-staff-modal',
  standalone: true,
  imports: [FormsModule], // Thêm FormsModule vào imports
  templateUrl: './call-staff-modal.component.html',
  styleUrls: ['./call-staff-modal.component.css']
})
export class CallStaffModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitRequest = new EventEmitter<string>(); // Gửi message ra ngoài

  message: string = '';

  close(): void {
    this.closeModal.emit();
  }

  submit(): void {
    this.submitRequest.emit(this.message);
    this.message = ''; // Xóa message sau khi gửi
    this.close(); // Tự động đóng modal
  }
}