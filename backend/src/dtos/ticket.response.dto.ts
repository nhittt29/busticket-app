export interface CreateResponse {
  message: string;
  ticket: any;
  payment: any;
}

export interface BulkCreateResponse {
  tickets: any[];
  paymentHistoryId: number;
  payUrl?: string;
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
<<<<<<< HEAD
  discountAmount: number;
=======
>>>>>>> c9cddcb477d486f593c5a5c3fb56875c99670747
}

// THÊM MỚI – THÔNG TIN ĐIỂM TRẢ
export interface DropoffInfo {
  type: 'tannoi' | 'diemtra' | 'default';
  display: string;
  address: string;
  surcharge: number;
  surchargeText: string;
}