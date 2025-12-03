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
  seatNumber: string;
  price: string;
  paymentMethod: string;
  status: string;
  paidAt: string;
  transactionId: string;
  qrCode: string | null;
  paymentHistoryId: number;
  ticketIds: number[];
  discountAmount: number;
}

// THÊM MỚI – THÔNG TIN ĐIỂM TRẢ
export interface DropoffInfo {
  type: 'tannoi' | 'diemtra' | 'default';
  display: string;
  address: string;
  surcharge: number;
  surchargeText: string;
}