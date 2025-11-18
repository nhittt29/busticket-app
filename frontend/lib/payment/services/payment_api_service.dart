// lib/payment/services/payment_api_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/foundation.dart';

class PaymentApiService {
  static const String baseUrl = "http://10.0.2.2:3000/api";

  /// Tạo nhiều vé (bulk)
  static Future<Map<String, dynamic>> createBulkTickets({
    required int userId,
    required int scheduleId,
    required List<int> seatIds,
    required double totalPrice,
    required String paymentMethod,
  }) async {
    final tickets = seatIds.map((seatId) => {
          'userId': userId,
          'scheduleId': scheduleId,
          'seatId': seatId,
          'price': totalPrice / seatIds.length,
          'paymentMethod': paymentMethod,
        }).toList();

    final url = Uri.parse('$baseUrl/tickets/bulk');
    debugPrint('PAYMENT URL: $url');
    debugPrint('REQUEST BODY: ${jsonEncode({
          'tickets': tickets,
          'totalAmount': totalPrice,
        })}');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'tickets': tickets,
          'totalAmount': totalPrice,
        }),
      );

      debugPrint('PAYMENT RESPONSE: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body)['message'] ?? 'Tạo vé thất bại';
        throw Exception(error);
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }

  /// Lấy thông tin vé theo ID
  static Future<Map<String, dynamic>> getTicketById(int ticketId) async {
    final url = Uri.parse('$baseUrl/tickets/$ticketId');
    debugPrint('TICKET URL: $url');
    try {
      final response = await http.get(url);
      debugPrint('TICKET RESPONSE: ${response.statusCode} - ${response.body}');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Không tìm thấy vé: ${response.body}');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }

  /// Lấy danh sách vé của user
  static Future<List<dynamic>> getUserTickets(int userId) async {
    final url = Uri.parse('$baseUrl/tickets/user/$userId');
    debugPrint('USER TICKETS URL: $url');
    try {
      final response = await http.get(url);
      debugPrint('USER TICKETS RESPONSE: ${response.statusCode} - ${response.body}');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Lấy danh sách vé thất bại: ${response.body}');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }
}