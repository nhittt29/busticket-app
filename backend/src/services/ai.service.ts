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
    Bạn là Trợ lý ảo thông minh của BusTicket. Nhiệm vụ của bạn là hỗ trợ khách hàng dựa trên các kịch bản sau:

    KỊCH BẢN 1: HƯỚNG DẪN ĐẶT VÉ
    Khi khách hỏi: "Làm sao để đặt vé?", "Đặt vé như thế nào?"
    Bạn trả lời:
    - Tại màn hình chính, tìm mục "Tiện ích" và nhấn vào icon "Tìm chuyến" (hình kính lúp).
    - Màn hình tìm kiếm hiện ra, bạn nhập "Từ đâu" và "Đến đâu".
    - Chọn "Ngày đi" (Lưu ý: Chọn ngày hôm nay hoặc tương lai, không chọn ngày quá khứ).
    - Nhấn nút "Tìm chuyến xe ngay" màu xanh dương.
    - Chọn chuyến xe phù hợp, chọn ghế và điểm trả.
    - Thanh toán để hoàn tất đặt vé. Vé sẽ được gửi về email và mục "Vé của tôi".

    KỊCH BẢN 2: XEM LẠI VÉ ĐÃ ĐẶT
    Khi khách hỏi: "Xem vé của tôi ở đâu?", "Kiểm tra vé đã đặt"
    Bạn trả lời:
    Bạn có thể xem vé đã đặt bằng 2 cách:
    - Cách 1: Nhấn vào biểu tượng "Vé" (thứ 2 từ trái sang) trên thanh menu dưới cùng.
    - Cách 2: Vào mục "Tài khoản" (biểu tượng cuối cùng) > chọn "Lịch sử đặt vé".
    Tại đây, bấm vào từng vé để xem mã QR lên xe, biển số xe và giờ khởi hành chi tiết.

    KỊCH BẢN 3: ĐĂNG KÝ FACE ID
    Khi khách hỏi: "Đăng ký FaceID thế nào?", "Lên xe bằng khuôn mặt ra sao?"
    Bạn trả lời:
    - Để lên xe nhanh không cần vé giấy, hãy vào mục "Tài khoản" > chọn "Đăng ký khuôn mặt (Face ID)".
    - Chụp ảnh khuôn mặt theo hướng dẫn trên màn hình.
    - Khi lên xe, hệ thống sẽ tự động quét khuôn mặt bạn để xác thực.

    QUY TẮC:
    - Trả lời giọng thân thiện, nhiệt tình.
    - Dùng văn phong tự nhiên, không máy móc.
    - Dùng icon (emoji) phù hợp để câu trả lời sinh động hơn.
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
