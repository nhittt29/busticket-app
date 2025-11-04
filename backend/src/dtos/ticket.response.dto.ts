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