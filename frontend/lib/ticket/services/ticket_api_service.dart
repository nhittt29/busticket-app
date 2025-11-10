// lib/ticket/services/ticket_api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class TicketApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/api';

  static Future<List<dynamic>> getUserTickets(int userId) async {
    final response = await http.get(Uri.parse('$baseUrl/tickets/user/$userId'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Không thể tải danh sách vé');
  }

  static Future<Map<String, dynamic>> getTicketDetail(int ticketId) async {
    final response = await http.get(Uri.parse('$baseUrl/tickets/$ticketId'));
    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Không tải được chi tiết vé');
  }

  // ĐÃ SỬA: BẮT LỖI JSON RỖNG + TRIM + TRY-CATCH
  static Future<Map<String, dynamic>?> getPaymentDetail(int ticketId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/tickets/$ticketId/payment'));
      if (response.statusCode == 200) {
        final body = response.body.trim();
        if (body.isEmpty) return null;
        return json.decode(body) as Map<String, dynamic>;
      }
    } catch (e) {
      print('Lỗi lấy payment detail: $e');
    }
    return null;
  }

  static Future<void> cancelTicket(int ticketId) async {
    final response = await http.delete(Uri.parse('$baseUrl/tickets/$ticketId'));
    if (response.statusCode != 200) {
      final errorBody = response.body.isNotEmpty ? json.decode(response.body) : {};
      final message = errorBody['message'] ?? 'Hủy vé thất bại';
      throw Exception(message);
    }
  }
}