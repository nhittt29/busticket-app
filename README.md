# BUSTICKET - Tài Liệu Kỹ Thuật Dự Án

BUSTICKET là hệ thống quản lý và đặt vé xe khách trực tuyến cho Bến xe Miền Đông, bao gồm ứng dụng di động cho khách hàng và hệ thống Backend API quản lý tập trung. Tài liệu này hướng dẫn cấu trúc dự án, cách cài đặt môi trường phát triển và các quy ước lập trình (coding standards).

---

## 1. Kiến trúc và Tổ chức Thư mục

Dự án được tổ chức theo mô hình Monorepo bao gồm 2 thư mục chính:

```
busticket-app/
├── backend/
│   ├── src/
│   │   ├── config/         # Cấu hình hệ thống (Environment, Constants)
│   │   ├── controllers/    # Tiếp nhận request (API Endpoints)
│   │   ├── dtos/           # Data Transfer Objects (Validation)
│   │   ├── models/         # Database Models
│   │   ├── modules/        # Các module nghiệp vụ (Auth, User, Bus...)
│   │   ├── queues/         # Xử lý background job (Redis Bull)
│   │   ├── redis/          # Cấu hình Redis Cache
│   │   ├── repositories/   # Tương tác Database (Prisma)
│   │   ├── services/       # Logic nghiệp vụ chính
│   │   ├── stats/          # Thống kê báo cáo
│   │   ├── validators/     # Custom validators
│   │   ├── app.module.ts   # Root Module
│   │   └── main.ts         # Entry point
│   ├── test/               # Unit & E2E Tests
│   └── package.json
│
├── frontend/
│   ├── assets/             # Tài nguyên (Images, Icons, Fonts)
│   ├── lib/
│   │   ├── ai_chat/        # Tính năng Chatbot & Voice
│   │   ├── bloc/           # Global State Management
│   │   ├── booking/        # Quy trình đặt vé (Chọn ghế, lịch trình)
│   │   ├── models/         # Data Models (Dart Objects)
│   │   ├── payment/        # Tích hợp thanh toán (Zalo, Momo, VNPAY)
│   │   ├── promotions/     # Quản lý khuyến mãi
│   │   ├── repositories/   # Data Layer (API fetching)
│   │   ├── review/         # Đánh giá & Phản hồi
│   │   ├── screens/        # Các màn hình chung (Home, Login, Profile)
│   │   ├── services/       # Các service tiện ích (API, Storage, Format)
│   │   ├── theme/          # Hình ảnh giao diện (Colors, Fonts)
│   │   ├── ticket/         # Quản lý vé của tôi (QR Code, History)
│   │   └── main.dart       # Entry point
│   └── pubspec.yaml
│
└── README.md
```

### Backend (backend/)
Xây dựng 3 tầng (3-layer architecture) dựa trên NestJS Framework:
- **src/modules**: Chứa các Module nghiệp vụ chính (Auth, Bus, Ticket, Booking, Payment, ...).
- **src/controllers**: Tiếp nhận request và trả về response, không chứa logic nghiệp vụ.
- **src/services**: Xử lý logic nghiệp vụ api, tương tác với cơ sở dữ liệu.
- **src/repositories**: Lớp tương tác trực tiếp với Database (Prisma Client).
- **src/queues**: Xử lý các tác vụ nền (Background Jobs) với Redis/Bull (Ví dụ: Hủy vé quá hạn).

### Frontend (frontend/)
Phát triển bằng Flutter cho ứng dụng di động Android/iOS:
- **lib/screens**: Chứa giao diện màn hình (UI).
- **lib/bloc**: Quản lý trạng thái ứng dụng (State Management) theo mô hình BLoC.
- **lib/services**: Chứa các lớp giao tiếp với Backend API và các dịch vụ bên thứ 3 (ZaloPay, AI, ...).
- **lib/payment**: Module riêng biệt xử lý thanh toán (ZaloPay, MoMo, VNPAY).
- **lib/ai_chat**: Module trợ lý ảo và xử lý giọng nói (Voice to Text).

---

## 2. Hướng dẫn Cài đặt Môi trường (Local Development)

### 2.1 Khởi tạo Ứng dụng Di động (Frontend)
Yêu cầu: Đã cài đặt Flutter SDK.

1.  Di chuyển vào thư mục frontend:
    ```bash
    cd frontend
    ```
2.  Cài đặt các thư viện phụ thuộc:
    ```bash
    flutter pub get
    ```
3.  Cấu hình địa chỉ IP API:
    - Mở file `lib/services/api_service.dart`.
    - Cập nhật biến `baseUrl` thành địa chỉ IP LAN của máy tính (nếu chạy trên thiết bị thật) hoặc `10.0.2.2` (nếu chạy trên Android Emulator).
4.  Khởi chạy ứng dụng:
    ```bash
    flutter run
    ```

### 2.2 Khởi tạo Hệ thống Backend
Yêu cầu: Node.js, PostgreSQL, Redis.

1.  Di chuyển vào thư mục backend:
    ```bash
    cd backend
    ```
2.  Cài đặt các gói thư viện:
    ```bash
    npm install
    ```
3.  Cấu hình biến môi trường:
    - Sao chép file `.env.example` thành `.env`.
    - Cập nhật chuỗi kết nối Database (`DATABASE_URL`), Redis Host và các API Key (ZaloPay, MoMo, VNPAY, Google AI).
4.  Đồng bộ cấu trúc cơ sở dữ liệu (Prisma):
    ```bash
    npx prisma migrate dev
    ```
5.  Khởi chạy server ở chế độ development:
    ```bash
    npm run start:dev
    ```
    Server sẽ hoạt động tại địa chỉ: `http://localhost:3000`.

---

## 3. Quy ước Phát triển và Tiêu chuẩn Code

### 3.1 Quy tắc Đặt tên
- **Biến và Hàm (Variables/Functions):** Sử dụng camelCase. (Ví dụ: `getTicketDetails`, `isPaymentSuccess`).
- **Lớp (Classes):** Sử dụng PascalCase. (Ví dụ: `AuthController`, `PaymentService`).
- **Tên File:** Sử dụng snake_case. (Ví dụ: `auth_controller.ts`, `home_screen.dart`).
- **Hằng số (Constants):** Sử dụng SCREAMING_SNAKE_CASE. (Ví dụ: `MAX_TIMEOUT_SECONDS`).

### 3.2 Clean Code và Modularity
- **Backend:** Tuân thủ nguyên tắc D.R.Y (Don't Repeat Yourself) và S.O.L.I.D. Mỗi Service chỉ nên đảm nhận một nhiệm vụ cụ thể. Logic phức tạp nên được tách ra khỏi Controller.
- **Frontend:** Sử dụng BLoC để tách biệt logic nghiệp vụ (Business Logic) khỏi giao diện (UI). Các Widget nên được chia nhỏ để tái sử dụng (Reusable Widgets).

### 3.3 Quản lý Cấu hình
- Không lưu trữ thông tin nhạy cảm (Mật khẩu DB, API Keys, Secret Keys) trực tiếp trong Source Code.
- Sử dụng file `.env` để quản lý các biến môi trường.
- File `.env` đã được thêm vào `.gitignore` để tránh lộ lọt thông tin.

### 3.4 Quy ước API
- API phải trả về dữ liệu đồng nhất theo cấu trúc JSON:
    ```json
    {
      "data": { ... },
      "message": "Mô tả kết quả",
      "statusCode": 200
    }
    ```
- Sử dụng đúng các động từ HTTP (GET, POST, PUT, DELETE) theo chuẩn RESTful API.
