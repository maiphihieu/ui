import { ChangeDetectorRef, Component, OnDestroy, OnInit, NgZone } from '@angular/core';
import { ChildrenOutletContexts, Router, RouterLink, RouterOutlet } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { AuthService } from '../../../Services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { slideInAnimation } from '../../Animations/animations';
import { AdminChatModalComponent } from '../../Components/admin/admin-chat-modal/admin-chat-modal.component';
import { StaffCall } from '../../../Models/StaffCall';
import { ChatMessage } from '../../../Models/ChatMessage';
import { SignalrService } from '../../../Services/signalr.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AdminChatModalComponent, CommonModule, DatePipe],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  animations: [
    slideInAnimation
  ]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  public newStaffCallCount = 0;
  public staffCalls: StaffCall[] = [];
  public showCallList = false;
  public chatSessions = new Map<string, ChatMessage[]>();
  public activeChatToken: string | null = null;
  public activeChatTableName: string = 'N/A';

  constructor(
    private authService: AuthService,
    private signalrService: SignalrService,
    private contexts: ChildrenOutletContexts,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private zone: NgZone
  ) { }

ngOnInit(): void {
    this.signalrService.startConnection();
    
    // === SỬA LẠI HÀM NÀY ===
    this.signalrService.addReceiveStaffCallListener((data: StaffCall) => {
      this.zone.run(() => {
        console.log('Received Staff Call (Bell & First Message):', data);
        
        // 1. Cập nhật Chuông/Toastr
        if (!this.staffCalls.some(call => call.timestamp === data.timestamp && call.tableToken === data.tableToken)) {
             this.staffCalls.unshift(data);
        }
        if (!this.showCallList) {
             this.newStaffCallCount++;
        }
        if (this.activeChatToken !== data.tableToken) {
            this.toastr.warning(data.message, `Bàn ${data.tableName} gọi!`, {
              disableTimeOut: true, closeButton: true, tapToDismiss: false
            });
        }
        
        // 2. LƯU LẠI TIN NHẮN ĐẦU TIÊN
        const firstMessage: ChatMessage = {
          tableToken: data.tableToken,
          text: data.messageText, 
          sender: 'customer',
          timestamp: data.timestamp,
          tableName: data.tableName
        };

        // 3. THÊM VÀO chatSessions (QUAN TRỌNG)
        if (data.tableToken) {
            if (!this.chatSessions.has(data.tableToken)) {
              // Tạo session mới với tin nhắn đầu
              this.chatSessions.set(data.tableToken, [firstMessage]);
            } else {
              // Nếu session đã có, kiểm tra trùng lặp trước khi thêm
              const session = this.chatSessions.get(data.tableToken)!;
              const isDuplicate = session.some(m => m.timestamp === firstMessage.timestamp && m.sender === firstMessage.sender);
              if (!isDuplicate) {
                 session.push(firstMessage);
              }
            }
        }
        // === KẾT THÚC SỬA ===

        this.cdr.detectChanges();
      });
    });

    // 2. LẮNG NGHE TIN NHẮN (ĐỂ THÊM VÀO CHAT)
    this.signalrService.addReceiveMessageListener((message: ChatMessage) => {
      this.zone.run(() => {
        if (!message.tableToken) return;

        // Đảm bảo phiên chat tồn tại
        if (!this.chatSessions.has(message.tableToken)) {
          this.chatSessions.set(message.tableToken, []);
        }

        const session = this.chatSessions.get(message.tableToken)!;

        // Kiểm tra trùng lặp
        const isDuplicate = session.some(m =>
          m.timestamp === message.timestamp &&
          m.sender === message.sender
        );

        // Chỉ thêm nếu không trùng
        if (!isDuplicate) {
          session.push(message);
        }

        // Thông báo toastr nếu cần (có thể bỏ nếu không muốn 2 toastr)
        // if (message.sender === 'customer' && this.activeChatToken !== message.tableToken) {
        //   this.toastr.info(`Tin nhắn mới từ bàn ${message.tableName}`);
        // }

        this.cdr.detectChanges();
      });
    });
  }
  ngOnDestroy(): void {
    this.signalrService.stopConnection();
  }

  logout(): void {
    this.authService.logout();
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  toggleCallList(): void {
    if (this.activeChatToken) {
      this.closeChatModal();
      return;
    }
    this.showCallList = !this.showCallList;
    if (this.showCallList) {
      this.newStaffCallCount = 0;
    }
    this.cdr.detectChanges();
  }

  dismissCall(index: number): void {
    this.staffCalls.splice(index, 1);
    this.cdr.detectChanges();
  }

  openChatForTable(call: StaffCall): void {
    const token = call.tableToken;
    if (!token) return;

    this.activeChatTableName = call.tableName;
    this.activeChatToken = token;

    this.signalrService.joinTableRoom(token);

    this.showCallList = false;

    const callIndex = this.staffCalls.findIndex(c => c.tableToken === token);
    if (callIndex > -1) {
      this.dismissCall(callIndex);
    }
  }

  closeChatModal(): void {
    this.activeChatToken = null;
    this.activeChatTableName = 'N/A';
  }

  // === SỬA LỖI: THÊM LOGIC "OPTIMISTIC UPDATE" VÀO ĐÂY ===
  onAdminSendMessage(message: string): void {
    if (this.activeChatToken && message) {

      // 1. Tạo tin nhắn local của Admin
      const localMessage: ChatMessage = {
        tableToken: this.activeChatToken,
        text: message,
        sender: 'staff',
        timestamp: new Date().toISOString(),
        tableName: 'Staff' // Tên hiển thị cho Admin
      };

      // 2. Thêm ngay vào mảng chat (để tự hiển thị)
      if (!this.chatSessions.has(this.activeChatToken)) {
        this.chatSessions.set(this.activeChatToken, []);
      }
      this.chatSessions.get(this.activeChatToken)!.push(localMessage);

      // 3. Gửi tin nhắn lên server (để khách nhận)
      this.signalrService.sendMessageFromStaff(this.activeChatToken, message);
    }
  }
}