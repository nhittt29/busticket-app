import { Role } from './Role';
import { Ticket } from './Ticket';

export interface User {
  id: number;
  uid: string;                 // UID từ Firebase
  name: string;                // Tên người dùng
  email: string;               // Email duy nhất
  phone?: string;              // Số điện thoại (tùy chọn)
  avatar?: string;             // 🔹 Đường dẫn ảnh đại diện (upload hoặc ảnh mặc định)
  isActive: boolean;           // Tình trạng tài khoản
  roleId: number;              // Khóa ngoại tới Role
  role?: Role;                 // Quan hệ Role
  tickets?: Ticket[];          // Danh sách vé đã đặt
  createdAt?: Date;            // Thời gian tạo
  updatedAt?: Date;            // Thời gian cập nhật
}
