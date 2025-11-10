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

  // ĐÃ SỬA: Trả về Map<String, dynamic>
  static Future<Map<String, dynamic>> getTicketDetail(int ticketId) async {
    final response = await http.get(Uri.parse('$baseUrl/tickets/$ticketId'));
    if (response.statusCode == 200) {
      return json.decode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Không tải được chi tiết vé');
  }

  // MỚI: LẤY CHI TIẾT THANH TOÁN (có qrCode)
  static Future<Map<String, dynamic>?> getPaymentDetail(int ticketId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/tickets/$ticketId/payment'));
      if (response.statusCode == 200) {
        return json.decode(response.body) as Map<String, dynamic>;
      }
    } catch (e) {
      print('Lỗi lấy payment detail: $e');
    }
    return null;
  }

  static Future<void> cancelTicket(int ticketId) async {
    final response = await http.delete(Uri.parse('$baseUrl/tickets/$ticketId'));
    if (response.statusCode != 200) {
      throw Exception('Hủy vé thất bại');
    }
  }
}