import { Brand } from './Brand';
import { Schedule } from './Schedule';

export enum BusType {
  MINIVAN_16 = 'MINIVAN_16',
  COACH_30 = 'COACH_30',
  COACH_45 = 'COACH_45',
  LIMOUSINE = 'LIMOUSINE',
}

export interface Bus {
  id: number;
  name: string;              // Tên xe
  licensePlate: string;      // Biển số xe
  seatCount: number;         // Số ghế
  type: BusType;             // Loại xe
  brandId: number;           // Khóa ngoại trỏ đến Brand
  brand?: Brand;             // Quan hệ Brand
  schedules?: Schedule[];    // Danh sách chuyến chạy
  createdAt?: string;        // Ngày tạo (ISO string)
  updatedAt?: string;        // Ngày cập nhật (ISO string)
}
