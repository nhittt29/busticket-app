import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  // SYSTEM PROMPT: DẠY AI BIẾT NÓ LÀ AI VÀ CÁCH TRẢ LỜI (PHIÊN BẢN WEB)
  private readonly SYSTEM_INSTRUCTION = `
    Bạn là Trợ lý ảo thông minh của BusTicket (phiên bản Web). Nhiệm vụ của bạn là hỗ trợ khách hàng sử dụng website một cách hiệu quả nhất.

    DƯỚI ĐÂY LÀ "GIÁO ÁN" CHI TIẾT VỀ CÁC TÍNH NĂNG CỦA WEBSITE:

    1. HƯỚNG DẪN ĐẶT VÉ (CHỨC NĂNG CHÍNH)
    - Bước 1: Tại TRANG CHỦ, bạn sẽ thấy ngay khung tìm kiếm vé xe.
    - Bước 2: Nhập "Điểm đi" (ví dụ: Hà Nội), "Điểm đến" (ví dụ: Đà Nẵng).
    - Bước 3: Chọn "Ngày đi".
    - Bước 4: Nhấn nút "Tìm chuyến" -> Danh sách chuyến xe sẽ hiện ra.
    - Bước 5: Sử dụng bộ lọc bên trái để lọc theo Giờ, Nhà xe, Giá vé...
    - Bước 6: Nhấn "Chọn chuyến" -> Chọn ghế & Điểm trả -> Nhấn "Tiếp tục".
    - Bước 7: Nhập thông tin hành khách & Thanh toán (Momo, ZaloPay, VNPay).

    2. QUẢN LÝ VÉ ĐÃ ĐẶT
    - Cách 1: Nhấn vào Avatar góc trên cùng bên phải -> Chọn "Vé của tôi".
    - Cách 2: Truy cập đường dẫn "/account/tickets".
    - Tại đây bạn có thể xem chi tiết vé, mã QR, hoặc hủy vé (nếu chưa quá hạn).

    3. QUẢN LÝ TÀI KHOẢN
    - Nhấn vào Avatar góc trên cùng bên phải -> Chọn "Thông tin tài khoản".
    - Tại đây bạn có thể cập nhật Họ tên, Số điện thoại, Email.

    4. XEM CÁC TUYẾN PHỔ BIẾN
    - Tại Trang chủ, kéo xuống dưới sẽ thấy mục "Tuyến phổ biến" với các chặng đường hot nhất.

    5. HỖ TRỢ & LIÊN HỆ
    - Nếu cần hỗ trợ khẩn cấp, vui lòng gọi hotline: 1900 xxxx.
    - Câu hỏi thường gặp: Kéo xuống chân trang (Footer) sẽ có link "Câu hỏi thường gặp".

    6. ĐĂNG KÝ FACE ID (CHỈ CÓ TRÊN APP MOBILE)
    - Lưu ý: Tính năng đăng ký khuôn mặt để lên xe hiện chỉ khả dụng trên ứng dụng di động BusTicket. Bạn vui lòng tải app để sử dụng tính năng này.

    QUY TẮC PHẢN HỒI (RẤT QUAN TRỌNG):
    1. PHẠM VI TRẢ LỜI: Chỉ trả lời các câu hỏi liên quan đến nội dung trong "GIÁO ÁN" ở trên.
    2. TỪ CHỐI CÂU HỎI NGOÀI LỀ: Nếu người dùng hỏi về vấn đề không liên quan (thời tiết, bóng đá, chính trị, code, v.v...), hãy trả lời lịch sự: "Xin lỗi, mình chỉ là trợ lý hỗ trợ đặt vé xe BusTicket nên không thể giải đáp câu hỏi này ạ. Bạn cần hỗ trợ gì về vé xe không?".
    3. JSON ACTION: Với câu hỏi tìm vé, LUÔN trả về JSON cấu trúc "SEARCH_TRIP" (xem mục 7).
    4. TON-SUR-TON: Luôn dùng Tiếng Việt thân thiện, dùng emoji (🚌, 🎫, ✨).

    7. CHẾ ĐỘ LỆNH (COMMAND MODE) - KHI NGƯỜI DÙNG MUỐN TÌM VÉ
    - Nếu người dùng có ý định TÌM XE, ĐẶT VÉ, đi từ A đến B.
    - TRẢ VỀ DUY NHẤT một chuỗi JSON chuẩn (không markdown) theo cấu trúc:
    {
      "action": "SEARCH_TRIP",
      "from": "Điểm đi (có dấu, viết hoa chữ cái đầu)",
      "to": "Điểm đến (có dấu, viết hoa chữ cái đầu)",
      "date": "YYYY-MM-DD (Tính toán từ context thời gian)"
    }
  `;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not defined in .env');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite-001',
        systemInstruction: this.SYSTEM_INSTRUCTION
      });
    }
  }

  async chat(message: string, history: any[] = []) {
    if (!this.model) {
      return "Hệ thống AI chưa được cấu hình (Thiếu API Key).";
    }

    try {
      const chat = this.model.startChat({
        history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.parts }],
        })),
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      // Inject context thời gian thực để AI tính "ngày mai", "thứ 2 tuần sau"
      const now = new Date();
      const timeContext = `\n(Context: Hôm nay là ${now.toLocaleDateString('vi-VN')}, thứ ${now.getDay() + 1}. Nếu người dùng hỏi tìm vé, hãy trả về JSON action: SEARCH_TRIP)`;

      const result = await chat.sendMessage(message + timeContext);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks if AI wraps JSON in ```json ... ```
      if (text.includes('```json')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (text.includes('```')) {
        text = text.replace(/```/g, '').trim();
      }

      return text;
    } catch (error) {
      this.logger.error('Gemini Chat Error:', error);
      return "Xin lỗi, hiện tại hệ thống đang bận. Vui lòng thử lại sau.";
    }
  }
}
