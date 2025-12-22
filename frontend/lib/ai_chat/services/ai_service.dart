import 'dart:convert';
import 'package:http/http.dart' as http;

class AiService {
  // Đổi IP nếu chạy máy thật (Cmd: ipconfig -> IPv4)
  // Nếu chạy máy ảo Android: dùng 10.0.2.2
  // Nếu chạy thiết bị thật: Phải dùng IP LAN (VD: 192.168.1.x)
  static const String baseUrl = 'http://10.0.2.2:3000/api/ai/chat'; 

  Future<String> sendMessage(String message) async {
    try {
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'message': message}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return data['answer'] ?? "Lỗi: Không có dữ liệu trả về.";
      } else {
        return "Lỗi Server (${response.statusCode}): ${response.reasonPhrase}";
      }
    } catch (e) {
      return "Lỗi kết nối: $e";
    }
  }
}
