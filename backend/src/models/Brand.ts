import { Bus } from './Bus';
import { Route } from './Route';

export interface Brand {
  id: number;                // ID nhà xe
  name: string;              // Tên nhà xe
  phoneNumber?: string;      // Số điện thoại liên hệ (optional)
  image?: string;            // Logo hoặc banner (optional)
  address?: string;          // Địa chỉ (optional)
  createdAt?: string;        // Ngày tạo (ISO string)
  updatedAt?: string;        // Ngày cập nhật (ISO string)
  
  // Quan hệ
  buses?: Bus[];             // 🔹 Danh sách xe thuộc nhà xe
  routes?: Route[];          // 🔹 Danh sách tuyến đường phục vụ
}
