import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/promotion.dart';

class PromotionsService {
  // Sử dụng 10.0.2.2 cho Android Emulator, tương đương localhost
  static const String baseUrl = "http://10.0.2.2:3000/api/promotions";

  /// Lấy danh sách khuyến mãi đang hoạt động
  static Future<List<Promotion>> fetchActivePromotions() async {
    try {
      final response = await http.get(Uri.parse(baseUrl));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Promotion.fromJson(json)).toList();
      } else {
        throw Exception("Không thể tải danh sách khuyến mãi: ${response.body}");
      }
    } catch (e) {
      throw Exception("Lỗi kết nối: $e");
    }
  }

  /// Áp dụng mã khuyến mãi
  /// Trả về Map chứa: success, discountAmount, finalPrice, promotion
  static Future<Map<String, dynamic>> applyPromotion(String code, double orderValue) async {
    try {
      final response = await http.post(
        Uri.parse("$baseUrl/apply"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "code": code,
          "orderValue": orderValue,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return {
          "success": true,
          "discountAmount": (data['discountAmount'] as num).toDouble(),
          "finalPrice": (data['finalPrice'] as num).toDouble(),
          "promotion": Promotion.fromJson(data['promotion']),
        };
      } else {
        // Trả về lỗi từ backend (VD: Mã hết hạn, chưa đủ điều kiện...)
        throw Exception(data['message'] ?? "Áp dụng mã thất bại");
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll("Exception: ", ""));
    }
  }
}
