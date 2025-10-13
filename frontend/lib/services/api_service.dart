import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:mime/mime.dart';
import 'package:http_parser/http_parser.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = "http://10.0.2.2:3000/api/auth";
  // ⚠️ 10.0.2.2 là localhost cho Android Emulator

  /// ✅ Đăng ký (hỗ trợ upload ảnh bất kỳ định dạng)
  static Future<Map<String, dynamic>> register(
    String email,
    String password,
    String name,
    String phone, {
    File? avatarFile,
  }) async {
    var uri = Uri.parse("$baseUrl/register");
    var request = http.MultipartRequest('POST', uri);

    // 🧾 Thêm các field
    request.fields['email'] = email;
    request.fields['password'] = password;
    request.fields['name'] = name;
    request.fields['phone'] = phone;

    // 🖼️ Thêm file ảnh (nếu có)
    if (avatarFile != null) {
      final mimeType = lookupMimeType(avatarFile.path) ?? 'image/*';
      request.files.add(await http.MultipartFile.fromPath(
        'avatar',
        avatarFile.path,
        contentType: MediaType.parse(mimeType),
      ));
    }

    // 🚀 Gửi request
    final response = await request.send();
    final body = await response.stream.bytesToString();

    if (response.statusCode == 201) {
      return jsonDecode(body);
    } else {
      throw Exception(
          "Đăng ký thất bại: ${jsonDecode(body)['message'] ?? body}");
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
      final data = jsonDecode(response.body);

      // Lưu thông tin user vào SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('idToken', data['idToken']);
      await prefs.setString('uid', data['uid']);
      await prefs.setString('user', jsonEncode(data['user'])); // Lưu toàn bộ user object

      return data;
    } else {
      throw Exception("Đăng nhập thất bại: ${response.body}");
    }
  }

  /// ✅ Lấy thông tin user từ SharedPreferences
  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user');
    if (userString != null) {
      return jsonDecode(userString);
    }
    return null;
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

  /// ✅ Reset mật khẩu bằng email
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