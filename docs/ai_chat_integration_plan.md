# Kế hoạch Tích hợp Trợ lý ảo AI (Helpmate Style) vào BusTicket App

Tài liệu này ghi lại quy trình từng bước để tích hợp tính năng Chatbot AI (sử dụng Google Gemini) vào hệ thống hiện có.

## 1. Backend (NestJS)
**Mục tiêu**: Tạo "bộ não" xử lý ngôn ngữ tự nhiên, bảo mật API Key và cung cấp thông tin vé xe cho AI.

### Bước 1.1: Cài đặt Thư viện
*   Cài gói SDK chính thức của Google:
    ```bash
    npm install @google/generative-ai
    ```
*   Cài đặt `markdown-it` (nếu cần xử lý format text trước khi trả về, hoặc để client lo).

### Bước 1.2: Cấu hình Môi trường
*   Thêm `GEMINI_API_KEY` vào file `.env` (Lấy key từ Google AI Studio).

### Bước 1.3: Tạo Module AI (`AiModule`)
*   Tạo `ai.controller.ts`:
    *   Endpoint `POST /api/ai/chat`.
    *   Nhận body: `{ message: string, history: [] }`.
*   Tạo `ai.service.ts`:
    *   Khởi tạo `GoogleGenerativeAI` client.
    *   **System Prompt Engineering**: Tạo một đoạn văn bản hướng dẫn ("prompt") cố định để dạy AI biết nó là nhân viên BusTicket.
    *   *Ví dụ prompt*: "Bạn là trợ lý ảo của BusTicket. Nhiệm vụ của bạn là giúp khách đặt vé, kiểm tra lịch trình..."

### Bước 1.4: Tích hợp Dữ liệu Xe (Nâng cao)
*   Inject `TicketService` hoặc `ScheduleService` vào `AiService`.
*   Khi AI nhận câu hỏi liên quan đến "tìm xe", Service sẽ query database lấy danh sách chuyến xe và đưa dữ liệu đó vào prompt để AI trả lời chính xác.

---

## 2. Frontend (Flutter)
**Mục tiêu**: Tạo giao diện hội thoại (Chat UI) thân thiện, hỗ trợ nhập liệu bằng giọng nói.

### Bước 2.1: Cài đặt Thư viện
Thêm vào `pubspec.yaml`:
*   `flutter_markdown`: Để hiển thị câu trả lời của AI (có in đậm, gạch đầu dòng...).
*   `speech_to_text`: Để chuyển giọng nói thành văn bản (tính năng Mic).
*   `flutter_tts`: (Tùy chọn) Để AI đọc câu trả lời bằng giọng nói (Text-to-Speech).
*   `lottie`: Để làm hiệu ứng "AI đang suy nghĩ..." (loading animation).

### Bước 2.2: Tạo Giao diện Chat (`ChatScreen`)
*   Dùng `ListView.builder` để hiển thị danh sách tin nhắn.
*   Thiết kế **Bubble Chat**:
    *   Tin nhắn người dùng: Nền xanh, căn phải.
    *   Tin nhắn AI: Nền xám/trắng, căn trái, có Avatar Robot.
*   Khu vực nhập liệu (Bottom Bar):
    *   TextField nhập văn bản.
    *   Nút Gửi (Send).
    *   Nút Micro (Mic) để kích hoạt `speech_to_text`.

### Bước 2.3: Logic Kết nối
*   Tạo `AiRepository` hoặc `AiService` ở Frontend để gọi API `POST /api/ai/chat`.
*   Xử lý State Management (Bloc/Cubit):
    *   `ChatLoading`: Hiện hiệu ứng 3 chấm.
    *   `ChatSuccess`: Chèn câu trả lời mới vào list.
    *   `ChatError`: Báo lỗi đường truyền.

### Bước 2.4: Tích hợp vào Home
*   Thêm một nút nổi (**Floating Action Button**) hình Robot/Tai nghe ở góc màn hình `HomeScreen`.
*   Bấm vào nút này sẽ mở `ChatScreen` đè lên trên.

---

## 3. Quy trình Kiểm thử (Testing Flow)

1.  **Test API (Postman)**:
    *   Gửi câu hỏi: "Làm sao để đặt vé?".
    *   Mong đợi: JSON trả về hướng dẫn chi tiết (Lấy từ System Prompt).
2.  **Test UI (Emulator/Device)**:
    *   Gõ phím & gửi -> Thấy bong bóng chat hiện lên.
    *   Thấy tin nhắn trả lời từ AI format đẹp (Bold, List).
3.  **Test Voice**:
    *   Bấm Mic nói "Tìm xe đi Đà Lạt" -> App tự điền text vào ô nhập.
