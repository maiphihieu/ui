import { Component, EventEmitter, Output, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ChatMessage } from '../../../../Models/ChatMessage';
// (Đảm bảo đường dẫn này đúng)


@Component({
  selector: 'app-admin-chat-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, DatePipe],
  templateUrl: './admin-chat-modal.component.html',
  styleUrls: ['./admin-chat-modal.component.css']
})
export class AdminChatModalComponent implements AfterViewChecked {
  @Input() messages: ChatMessage[] = []; // Nhận mảng tin nhắn
  @Input() tableName: string = 'N/A'; // Nhận tên bàn
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitMessage = new EventEmitter<string>(); // Gửi tin nhắn đi

  @ViewChild('chatDisplayArea') private chatDisplayArea!: ElementRef;
  messageText: string = '';

  ngAfterViewChecked(): void {
    this.scrollToBottom(); // Tự cuộn xuống
  }

  close(): void {
    this.closeModal.emit();
  }

  submit(): void {
    if (this.messageText.trim() === '') return;
    this.submitMessage.emit(this.messageText);
    this.messageText = '';
  }

  private scrollToBottom(): void {
    try {
      this.chatDisplayArea.nativeElement.scrollTop = this.chatDisplayArea.nativeElement.scrollHeight;
    } catch (err) { }
  }
}