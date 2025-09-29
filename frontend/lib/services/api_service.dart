import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = "http://10.0.2.2:3000/api/auth";
  // ⚠️ 10.0.2.2 = localhost cho Android emulator

  /// ✅ Đăng ký
  static Future<Map<String, dynamic>> register(
      String email, String password, String name, String phone) async {
    final response = await http.post(
      Uri.parse("$baseUrl/register"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "email": email,
        "password": password,
        "name": name,
        "phone": phone,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception("Đăng ký thất bại: ${response.body}");
    }
  }

  /// ✅ Đăng nhập
  static Future<Map<String, dynamic>> login(
      String email, String password) async {
    final response = await http.post(
      Uri.parse("$baseUrl/login"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "email": email,
        "password": password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception("Đăng nhập thất bại: ${response.body}");
    }
  }

  /// ✅ Quên mật khẩu
  static Future<void> forgotPassword(String email) async {
    final response = await http.post(
      Uri.parse("$baseUrl/forgot-password"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email}),
    );

    if (response.statusCode != 200) {
      throw Exception("Không thể gửi email reset mật khẩu: ${response.body}");
    }
  }

  /// ✅ Reset mật khẩu (theo email, không cần UID nữa)
  static Future<void> resetPassword(String email, String newPassword) async {
    final response = await http.post(
      Uri.parse("$baseUrl/reset-password"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "email": email,
        "newPassword": newPassword,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception("Không thể reset mật khẩu: ${response.body}");
    }
  }
}
