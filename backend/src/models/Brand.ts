import { Bus } from './Bus';
import { Route } from './Route';

export interface Brand {
  id: number;
  name: string;              // Tên nhà xe
  phoneNumber?: string;      // SĐT liên hệ
  image?: string;            // Logo hoặc banner
  address?: string;          // Địa chỉ
  createdAt: Date;
  updatedAt: Date;

  // Quan hệ
  buses?: Bus[];             // Danh sách xe thuộc nhà xe
  routes?: Route[];          // Danh sách tuyến phục vụ
}
