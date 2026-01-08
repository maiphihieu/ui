import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Branch } from '../../../../Models/branch.model';
import { Store } from '../../../../Models/store.model';
import { Table } from '../../../../Models/table.model';
import { BranchService } from '../../../../Services/branch.service';
import { StoreService } from '../../../../Services/store.service';
import { TableService } from '../../../../Services/table.service';
import { CartService } from '../../../../Services/Cart.Service';
import { OrderService } from '../../../../Services/order.service';
import { PaymentModalComponent } from '../payment/payment-modal.component';
import { FeedbackModalComponent } from '../feedback-modal/feedback-modal.component';
import { ChatHistoryModalComponent } from '../chat-history-modal/chat-history-modal.component';
import { ChatMessage } from '../../../../Models/ChatMessage';
import { SignalrService } from '../../../../Services/signalr.service';
import { CallStaffModalComponent } from '../call-staff-modal/call-staff-modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    PaymentModalComponent,
    FeedbackModalComponent,
    ChatHistoryModalComponent,
    CallStaffModalComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  table: Table | null = null;
  branch: Branch | null = null;
  store: Store | null = null;
  isLoading = true;
  token: string | null = null;
  isPaymentModalVisible = false;
  isFeedbackModalVisible = false;
  currentTableName: string = 'N/A';
  showCallStaffModal = false;
  showChatHistoryModal = false;
  chatMessages: ChatMessage[] = [];
  unreadMessageCount: number = 0;
  greeting: string = 'Chào';
  // (Biến hasNewMessage không còn cần thiết, unreadMessageCount > 0 sẽ thay thế)

  constructor(
    private route: ActivatedRoute,
    private tableService: TableService,
    private branchService: BranchService,
    private orderService: OrderService,
    private storeService: StoreService,
    private cartService: CartService,
    private signalrService: SignalrService,
    private zone: NgZone,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    this.setGreeting();
    if (!this.token) {
      this.isLoading = false;
      return;
    }

    this.currentTableName = this.route.snapshot.queryParamMap.get('table_name') || 'N/A';

    this.signalrService.startAnonymousConnection().then(() => {
      this.signalrService.addReceiveMessageListener((message: ChatMessage) => {
        this.zone.run(() => {
          // Chỉ push tin nhắn của Staff (vì tin của customer tự thêm)
          if (message.sender === 'staff') {
            this.chatMessages.push(message);

            if (!this.showChatHistoryModal) {
              this.unreadMessageCount++;
              this.toastr.success(message.text, 'Tin nhắn mới từ nhân viên', {
                timeOut: 5000,
                closeButton: true,
                positionClass: 'toast-top-right'
              });
            }
          }
        });
      });

      if (this.token) {
        this.signalrService.joinTableRoom(this.token);
      }
    });

    this.cartService.loadCartForTable(this.token);

    this.tableService.getTableByToken(this.token).subscribe({
      next: (tableData) => {
        this.table = tableData;
        this.storeService.getStoreById(tableData.storeId).subscribe(storeData => {
          this.store = storeData;
        });
        this.branchService.getBranchById(tableData.branchId).subscribe(branchData => {
          this.branch = branchData;
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Token không hợp lệ!', err);
        this.isLoading = false;
      }
    });
  }

  private setGreeting(): void {
    const currentHour = new Date().getHours(); // Lấy giờ hiện tại (0-23)

    if (currentHour >= 4 && currentHour < 12) {
      this.greeting = 'Chào buổi sáng ☀️'; // 4:00 - 11:59
    } else if (currentHour >= 12 && currentHour < 13) {
      this.greeting = 'Chào buổi trưa 🕛'; // 12:00 - 12:59
    } else if (currentHour >= 13 && currentHour < 18) {
      this.greeting = 'Chào buổi chiều 🌇'; // 13:00 - 17:59
    } else if (currentHour >= 18 && currentHour < 22) {
      this.greeting = 'Chào buổi tối 🌃'; // 18:00 - 21:59
    } else {
      this.greeting = 'Chào ban đêm 🌃'; // 22:00 - 3:59
    }
  }
  // --- HÀM HELPER ĐỂ TỰ THÊM TIN NHẮN (OPTIMISTIC UPDATE) ---
  private addLocalMessage(message: string, isFirst: boolean): void {
    if (!this.token || !message.trim()) return;

    const displayName = (this.currentTableName !== 'N/A')
      ? this.currentTableName
      : (this.table?.name || this.token!);

    // 1. Tạo tin nhắn local ngay lập tức
    const localMessage: ChatMessage = {
      tableToken: this.token,
      text: message,
      sender: 'customer',
      timestamp: new Date().toISOString(), // Lấy giờ client
      tableName: displayName
    };

    // 2. Tự thêm vào mảng chat
    this.chatMessages.push(localMessage);

    // 3. Gửi lên server
    this.signalrService.sendMessageFromCustomer(this.token, displayName, message, isFirst);
  }

  // --- CÁC HÀM CŨ ---
  openPaymentModal(): void {
    this.isPaymentModalVisible = true;
  }
  handlePaymentRequest(paymentMethod: string): void {
    if (this.token) {
      this.orderService.requestPayment(this.token, paymentMethod).subscribe({
        next: () => {
          this.isPaymentModalVisible = false;
          alert('Đã gửi yêu cầu thanh toán thành công!');
        },
        error: (err) => { alert(`Lỗi: ${err.error}`); }
      });
    }
  }
  openFeedbackModal(): void {
    this.isFeedbackModalVisible = true;
  }

  // --- HÀM CHO MODAL 1 (Gửi yêu cầu) ---
  openCallStaffModal(): void {
    this.showCallStaffModal = true;
  }
  onCloseCallStaffModal(): void {
    this.showCallStaffModal = false;
  }
  onSubmitStaffRequest(message: string): void {
    // Sửa lại: Gọi hàm helper
    this.addLocalMessage(message || "Yêu cầu gọi nhân viên!", true); // Gửi tin nhắn mặc định nếu trống
    this.onCloseCallStaffModal();
    alert('Đã gửi yêu cầu, nhân viên sẽ trả lời bạn trong giây lát!');
  }

  // --- HÀM CHO MODAL 2 (Lịch sử chat) ---
  openChatHistoryModal(): void {
    this.showChatHistoryModal = true;
    this.unreadMessageCount = 0; // Sửa lỗi: Reset bộ đếm LÚC MỞ
  }
  onCloseChatHistoryModal(): void {
    this.showChatHistoryModal = false;
    // (Không cần reset bộ đếm ở đây)
  }
  onSendChatMessage(message: string): void {
    // Sửa lại: Gọi hàm helper
    this.addLocalMessage(message, false);
  }
}