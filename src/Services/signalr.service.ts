import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { StaffCall } from '../Models/StaffCall';
import { ChatMessage } from '../Models/ChatMessage';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;

  constructor(private authService: AuthService) { }

  public startConnection = () => {
    const token = this.authService.getToken();
    if (!token) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://api-ipos.onrender.com/orderHub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR Connection started.'))
      .catch(err => console.error('Error starting SignalR connection: ', err));
  };

  public startAnonymousConnection = () => {
    if (
      this.hubConnection &&
      this.hubConnection.state !== signalR.HubConnectionState.Disconnected
    ) {
      return Promise.resolve();
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://api-ipos.onrender.com/orderHub')
      .withAutomaticReconnect()
      .build();

    return this.hubConnection.start()
      .then(() => console.log('SignalR Connection started (Anonymous).'))
      .catch(err => console.error('Error starting SignalR anonymous connection: ', err));
  };

  public stopConnection = () => {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  };

  public addReceiveOrderNotificationListener(
    callback: (data: { message: string; orderId: number }) => void
  ) {
    this.hubConnection.on('ReceiveNewOrderNotification', callback);
  }

  public addReceivePaymentRequestListener(
    callback: (data: { message: string; orderId: number }) => void
  ) {
    this.hubConnection.on('ReceivePaymentRequest', callback);
  }

  public joinTableRoom(tableToken: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('JoinTableRoom', tableToken)
        .catch(err => console.error('Error joining table room:', err));
    }
  }

  public sendMessageFromCustomer(
    tableToken: string,
    tableName: string,
    message: string,
    isFirst: boolean
  ) {
    const request = {
      TableToken: tableToken,
      Message: message,
      IsFirstMessage: isFirst,
      TableName: tableName
    };

    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('SendMessageFromCustomer', request)
        .catch(err => console.error('Error sending customer message:', err));
    }
  }

  public sendMessageFromStaff(tableToken: string, message: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('SendMessageFromStaff', tableToken, message)
        .catch(err => console.error('Error sending staff message:', err));
    }
  }

  // 4. CÁC HÀM "NGHE" (Listen)
  public addReceiveStaffCallListener(callback: (data: StaffCall) => void) {
    this.hubConnection?.on('ReceiveStaffCall', callback);
  }

  public addReceiveMessageListener(callback: (data: ChatMessage) => void) {
    this.hubConnection?.on('ReceiveMessage', callback);
  }
}
