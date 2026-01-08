import { Component, EventEmitter, Output, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ChatMessage } from '../../../../Models/ChatMessage';


@Component({
  selector: 'app-chat-history-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, DatePipe], // Thêm CommonModule, DatePipe
  templateUrl: './chat-history-modal.component.html',
  styleUrls: ['./chat-history-modal.component.css']
})
export class ChatHistoryModalComponent implements AfterViewChecked {
  @Input() messages: ChatMessage[] = []; // Nhận mảng tin nhắn
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitMessage = new EventEmitter<string>(); // Gửi tin nhắn mới

  @ViewChild('chatDisplayArea') private chatDisplayArea!: ElementRef;
  messageText: string = '';

  ngAfterViewChecked(): void {
    this.scrollToBottom(); // Tự cuộn xuống dưới
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