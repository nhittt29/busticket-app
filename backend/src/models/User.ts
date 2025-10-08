import { Role } from './Role';
import { Ticket } from './Ticket';

export interface User {
  id: number;
  uid: string;           // UID từ Firebase
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;     // Trạng thái hoạt động
  roleId: number;        // Khóa ngoại tham chiếu Role
  role?: Role;           // Quan hệ với Role
  tickets?: Ticket[];    // Danh sách vé của người dùng
  createdAt?: string;    // Ngày tạo (ISO string)
  updatedAt?: string;    // Ngày cập nhật (ISO string)
}