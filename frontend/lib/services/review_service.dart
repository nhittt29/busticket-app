import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ReviewService {
  static const String baseUrl = 'http://10.0.2.2:3000/api/reviews';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('idToken');
  }

  Future<List<dynamic>> getMyReviews() async {
    final token = await _getToken();
    if (token == null) throw Exception('Chưa đăng nhập');

    final response = await http.get(
      Uri.parse('$baseUrl/my-reviews'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Lỗi tải lịch sử đánh giá: ${response.body}');
    }
  }

  Future<List<dynamic>> getUnreviewedTickets() async {
    final token = await _getToken();
    if (token == null) throw Exception('Chưa đăng nhập');

    final response = await http.get(
      Uri.parse('$baseUrl/unreviewed'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Lỗi tải vé chưa đánh giá: ${response.body}');
    }
  }

  Future<void> submitReview({
    required int ticketId,
    required int rating,
    String? comment,
  }) async {
    final token = await _getToken();
    if (token == null) throw Exception('Chưa đăng nhập');

    final response = await http.post(
      Uri.parse(baseUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'ticketId': ticketId,
        'rating': rating,
        'comment': comment ?? '',
      }),
    );

    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Gửi đánh giá thất bại: ${response.body}');
    }
  }
}
