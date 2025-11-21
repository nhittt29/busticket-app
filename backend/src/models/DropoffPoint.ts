// src/models/DropoffPoint.ts
export interface DropoffPoint {
  id: number;
  scheduleId: number;
  name: string;
  address: string | null;
  surcharge: number;
  isDefault: boolean;
  order: number;
  createdAt: Date;

  // Quan hệ (khi include)
  tickets?: any[];
}