// lib/ticket/services/ticket_api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class TicketApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/api';

  static Future<List<dynamic>> getUserTickets(int userId) async {
    final res =
        await http.get(Uri.parse('$baseUrl/tickets/user/$userId'));
    if (res.statusCode == 200) return json.decode(res.body);
    throw Exception('Load tickets failed');
  }

  static Future<Map<String, dynamic>> getTicketDetail(int id) async {
    final res = await http.get(Uri.parse('$baseUrl/tickets/$id'));
    if (res.statusCode == 200) return json.decode(res.body);
    throw Exception('Ticket not found');
  }

  static Future<Map<String, dynamic>?> getPaymentDetailByHistoryId(
      int paymentHistoryId) async {
    final res = await http
        .get(Uri.parse('$baseUrl/tickets/payments/history/$paymentHistoryId'));
    if (res.statusCode == 200 && res.body.isNotEmpty) {
      return json.decode(res.body);
    }
    return null;
  }

  static Future<Map<String, dynamic>?> getPaymentDetail(int ticketId) async {
    final res =
        await http.get(Uri.parse('$baseUrl/tickets/$ticketId/payment'));
    if (res.statusCode == 200 && res.body.isNotEmpty) {
      return json.decode(res.body);
    }
    return null;
  }

  static Future<Map<String, dynamic>> cancelTicket(int ticketId) async {
    final res = await http.delete(Uri.parse('$baseUrl/tickets/$ticketId'));
    final body = json.decode(res.body);
    if (res.statusCode == 200) return body;
    throw Exception(body['message'] ?? 'Hủy thất bại');
  }

  // HÀM MỚI – LẤY CHI TIẾT VÉ THEO paymentHistoryId (dùng cho DeepLink MoMo trả về)
  static Future<Map<String, dynamic>?> getTicketDetailByPaymentHistoryId(
      int paymentHistoryId) async {
    try {
      final res = await http.get(
        Uri.parse('$baseUrl/tickets/payment-history/$paymentHistoryId'),
        headers: {'Content-Type': 'application/json'},
      );
      if (res.statusCode == 200 && res.body.isNotEmpty) {
        return json.decode(res.body);
      }
    } catch (e) {
      print('Lỗi lấy vé theo paymentHistoryId: $e');
    }
    return null;
  }
}