import { Role } from './Role';
import { Ticket } from './Ticket';

export interface User {
  id: number;
  uid: string; // UID từ Firebase
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  role: Role;       // Mỗi user chỉ có 1 role
  roleId: number;   // Khóa ngoại tham chiếu Role
  tickets?: Ticket[];
  createdAt: Date;
}
