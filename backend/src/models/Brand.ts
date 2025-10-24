export interface Brand {
  id: number;
  name: string;
  phoneNumber?: string;
  image?: string;
  address?: string;
  dailyTicketLimit: number;
  createdAt: Date;
  updatedAt: Date;
}
