# Báo cáo Cấu trúc Hệ thống Web - BusTicket

## 1. Công nghệ Sử dụng (Technology Stack)

Hệ thống web được xây dựng trên nền tảng hiện đại, đảm bảo hiệu suất và khả năng mở rộng:

*   **Next.js & React:** Framework mạnh mẽ giúp xây dựng giao diện người dùng (UI), hỗ trợ tối ưu hóa hiệu suất và SEO cho hệ thống web.
*   **TypeORM (NestJS):** Giúp quản lý cấu trúc dữ liệu, tự động cập nhật cơ sở dữ liệu và thực hiện các truy vấn dữ liệu một cách trực quan, nhanh chóng tại phía backend.
*   **Axios (Next.js):** Công cụ gửi yêu cầu HTTP và nhận dữ liệu JSON từ backend, đảm bảo kết nối ổn định trên môi trường web.
*   **Tailwind CSS & Lucide React:** Hỗ trợ thiết kế giao diện hiện đại, phản hồi nhanh (Responsive) và cung cấp bộ icon chuyên nghiệp.
*   **Zustand:** Thư viện quản lý trạng thái (state management) gọn nhẹ, giúp đồng bộ dữ liệu giữa các thành phần trong ứng dụng web.
*   **Git và GitHub:** Công cụ quản lý mã nguồn, kiểm soát phiên bản và hỗ trợ phối hợp làm việc nhóm hiệu quả.

---

## 2. Các Thư viện Phụ trợ Chính

Để tối ưu hóa quá trình xử lý dữ liệu và trải nghiệm người dùng, ứng dụng Web sử dụng:

*   **Axios:** Để gửi các yêu cầu (request) HTTP và xử lý dữ liệu JSON từ Backend một cách linh hoạt và an toàn.
*   **Zustand:** Để quản lý trạng thái tập trung và đồng bộ hóa dữ liệu tức thì giữa giao diện người dùng và Server.

---

## 3. Quy trình tích hợp Cơ sở dữ liệu (Backend)

Tích hợp TypeScript với NestJS. TypeORM đóng vai trò là cầu nối giữa NestJS và database (Oracle). Các bước triển khai chính bao gồm:

1.  **Định nghĩa các Entity:** Tạo các lớp TypeScript để mô tả cấu trúc và quan hệ giữa các bảng dữ liệu.
2.  **Tự động đồng bộ cấu trúc (Synchronize):** Cấu hình TypeORM để tự động tạo hoặc cập nhật các bảng dựa trên Entity.
3.  **Import TypeOrmModule vào AppModule:** Thiết lập và quản lý kết nối cơ sở dữ liệu tập trung tại module gốc.
4.  **Inject Repository vào các module:** Sử dụng `@InjectRepository` để thực hiện các thao tác truy vấn và xử lý dữ liệu.

---

## 4. Cấu trúc Thư mục Dự án Web (Frontend)

Dự án được tổ chức theo mô hình Next.js App Router nhằm tối ưu hóa việc quản lý mã nguồn:

```text
src/
├── app/              # Định nghĩa Routing và các Trang (Pages) của ứng dụng
├── components/       # Các thành phần giao diện (UI) tái sử dụng (Button, Modal,...)
├── store/            # Quản lý trạng thái ứng dụng (State management với Zustand)
├── hooks/            # Chứa các React Hooks tùy chỉnh để xử lý logic giao diện
├── lib/              # Cấu hình API (Axios) và các thư viện tiện ích chung
├── types/            # Định nghĩa các kiểu dữ liệu và Interface (TypeScript)
├── assets/           # Lưu trữ hình ảnh, font chữ và các tài nguyên tĩnh
└── config/           # Các tệp cấu hình hệ thống và biến môi trường
```

### Chi tiết nhiệm vụ từng thư mục:

*   **app/**: Chứa cấu trúc các đường dẫn của website như trang chủ, tìm kiếm chuyến xe, đặt vé, lịch sử giao dịch và các Layout chung.
*   **components/**: Tập trung các thành phần UI dùng chung, giúp đảm bảo tính nhất quán về thiết kế và dễ dàng bảo trì.
*   **store/**: Chịu trách nhiệm quản lý trạng thái toàn cục của ứng dụng (như thông tin người dùng, giỏ hàng vé), giúp dữ liệu đồng bộ giữa các trang mà không cần tải lại.
*   **hooks/**: Tách biệt phần logic xử lý dữ liệu và hiệu ứng ra khỏi giao diện, giúp code sạch sẽ và dễ kiểm thử hơn.
*   **lib/**: Nơi thực hiện các tác vụ kết nối với Backend thông qua Axios, xử lý các yêu cầu gửi đi và phản hồi nhận về từ server.
*   **types/**: Đảm bảo tính chặt chẽ của dữ liệu xuyên suốt dự án, giảm thiểu lỗi trong quá trình phát triển nhờ sức mạnh của TypeScript.
*   **config/**: Quản lý các thông số hệ thống, giúp dễ dàng thay đổi môi trường chạy (Development/Production).
