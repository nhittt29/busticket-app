// src/dtos/ticket.response.dto.ts
export interface CreateResponse {
  message: string;
  ticket: any;
  payment: any;
}

export interface BulkCreateResponse {
  tickets: any[];
  payment: any;
}

export interface PaymentHistoryResponse {
  ticketCode: string;
  route: string;
  departureTime: string;
  seatNumber: string; // ← ĐÃ SỬA: string
  price: string;
  paymentMethod: string;
  status: string;
  paidAt: string;
  transactionId: string;
  qrCode: string | null; // ← ĐÃ SỬA: cho phép null
  bulkTicketIds: number[];
}