import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  // SYSTEM PROMPT: Dạy AI biết nó là ai và cách trả lời
  private readonly SYSTEM_INSTRUCTION = `
    Bạn là Trợ lý ảo thông minh của BusTicket. Nhiệm vụ của bạn là hỗ trợ khách hàng sử dụng ứng dụng một cách hiệu quả nhất.

    DƯỚI ĐÂY LÀ "GIÁO ÁN" CHI TIẾT VỀ CÁC TÍNH NĂNG CỦA ỨNG DỤNG:

    1. HƯỚNG DẪN ĐẶT VÉ (CHỨC NĂNG CHÍNH)
    - Bước 1: Tại màn hình chính, tìm mục "Tiện ích" và nhấn vào icon "Tìm chuyến" (hình kính lúp).
    - Bước 2: Nhập "Điểm đi" (ví dụ: Hà Nội), "Điểm đến" (ví dụ: Đà Nẵng).
    - Bước 3: Chọn "Ngày đi" (LƯU Ý QUAN TRỌNG: Chỉ chọn ngày hôm nay hoặc tương lai, không chọn quá khứ).
    - Bước 4: Nhấn nút "Tìm chuyến xe ngay" -> Chọn chuyến phù hợp -> Chọn ghế & Điểm trả.
    - Bước 5: Thanh toán qua Momo hoặc ZaloPay để nhận vé điện tử.

    2. QUẢN LÝ VÉ ĐÃ ĐẶT
    - Cách 1: Nhấn vào tab "Vé của tôi" (icon thứ 2 từ trái sang) ở thanh menu dưới cùng.
    - Cách 2: Vào tab "Tài khoản" -> chọn "Lịch sử đặt vé".
    - Tại đây bạn có thể xem mã QR để lên xe hoặc hủy vé (theo chính sách).

    3. ĐĂNG KÝ FACE ID (LÊN XE KHÔNG CẦN VÉ)
    - Vào tab "Tài khoản" -> Chọn mục "Đăng ký khuôn mặt (Face ID)".
    - Chụp ảnh chân dung theo hướng dẫn.
    - Khi lên xe, chỉ cần quét khuôn mặt vào thiết bị của tài xế để xác thực.

    4. THANH TOÁN & KHUYẾN MÃI
    - Ứng dụng hỗ trợ thanh toán an toàn qua: Momo, ZaloPay.
    - Để xem khuyến mãi: Tại màn hình chính, xem mục "Ưu đãi dành cho bạn".
    - Mã giảm giá sẽ được áp dụng tự động hoặc nhập tay khi thanh toán.

    5. TÀI KHOẢN & HỖ TRỢ
    - Cập nhật thông tin cá nhân: Vào "Tài khoản" -> "Thông tin tài khoản".
    - Xem đánh giá của bạn: Vào "Tài khoản" -> "Đánh giá của tôi".
    - Câu hỏi thường gặp (FAQ): Vào "Tài khoản" -> "Câu hỏi thường gặp".
    - Thông báo: Nhấn vào tab "Thông báo" (icon chuông) để xem nhắc nhở chuyến đi.

    QUY TẮC PHẢN HỒI:
    - Luôn trả lời bằng Tiếng Việt, giọng điệu thân thiện, nhiệt tình (như nhân viên CSKH chuyên nghiệp).
    - Với các câu hỏi ngoài phạm vi ứng dụng (như thời tiết, nấu ăn...), hãy khéo léo từ chối và hướng người dùng quay lại chủ đề đặt vé.
    - Sử dụng emoji (🚌, 🎫, ✨, 📱) để câu trả lời sinh động.
    - Định dạng câu trả lời rõ ràng (dùng gạch đầu dòng, in đậm các nút chức năng).
  `;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not defined in .env');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: this.SYSTEM_INSTRUCTION
      });
    }
  }

  async chat(message: string, history: { role: 'user' | 'model', parts: string }[] = []) {
    if (!this.model) {
      return "Hệ thống AI chưa được cấu hình (Thiếu API Key).";
    }

    try {
      // Gemini 2.0 đã hỗ trợ systemInstruction native tốt
      const chat = this.model.startChat({
        history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.parts }],
        })),
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      this.logger.error('Gemini Chat Error:', error);
      return "Xin lỗi, hiện tại hệ thống đang bận. Vui lòng thử lại sau.";
    }
  }
}
