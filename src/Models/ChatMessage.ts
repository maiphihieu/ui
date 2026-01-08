export interface ChatMessage {
  tableToken: string;
  text: string;
  sender: 'customer' | 'staff';
  timestamp: string;
  tableName: string;
  
}