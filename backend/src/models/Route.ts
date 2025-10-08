export interface Route {
  id: number;
  startPoint: string;           // Nơi khởi hành
  endPoint: string;             // Nơi đến
  averageDurationMin: number;   // Thời lượng trung bình (phút)
  lowestPrice: number;          // Giá vé thấp nhất
  distanceKm?: number;          // Quãng đường ước lượng (km)
  image?: string;               // Hình minh họa tuyến
  brandId?: number;             // Nhà xe chính phục vụ
  brand?: {
    id: number;
    name: string;
    image?: string;
  };                            // Thông tin cơ bản của nhà xe (optional)
  createdAt: string;            // ISO date string
  updatedAt: string;            // ISO date string
}
