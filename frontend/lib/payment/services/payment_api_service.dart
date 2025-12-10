// lib/payment/services/payment_api_service.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart' as http;
import '../../booking/cubit/booking_cubit.dart';

class PaymentApiService {
  static const String baseUrl = "http://10.0.2.2:3000/api";

  /// Tạo nhiều vé (bulk) – Backend tự tính phụ thu, không gửi surcharge từ app nữa
  static Future<Map<String, dynamic>> createBulkTickets({
    required BuildContext context,
    required int userId,
    required int scheduleId,
    required List<int> seatIds,
    required double totalPrice, // Đây chính là finalTotalPrice (đã bao gồm phụ thu nếu có)
    required String paymentMethod,
    int? promotionId,
    double? discountAmount,
  }) async {
    final bookingState = context.read<BookingCubit>().state;

    // Giá gốc mỗi ghế (không có phụ thu) → backend sẽ tự cộng phụ thu nếu cần
    final double basePricePerSeat = bookingState.totalPrice / seatIds.length;

    final List<Map<String, dynamic>> tickets = seatIds.map((seatId) {
      final Map<String, dynamic> ticket = {
        'userId': userId,
        'scheduleId': scheduleId,
        'seatId': seatId,
        'price': basePricePerSeat,
        'paymentMethod': paymentMethod,
      };

      // Chỉ gửi điểm trả nếu có chọn điểm đón/trả cố định
      if (bookingState.selectedDropoffPoint != null &&
          bookingState.selectedDropoffPoint!.id > 0) {
        ticket['dropoffPointId'] = bookingState.selectedDropoffPoint!.id;
      }

      // Chỉ gửi địa chỉ trả tận nơi nếu người dùng nhập
      if (bookingState.dropoffAddress != null &&
          bookingState.dropoffAddress!.trim().isNotEmpty) {
        ticket['dropoffAddress'] = bookingState.dropoffAddress!.trim();
      }

      return ticket;
    }).toList();

    final Uri url = Uri.parse('$baseUrl/tickets/bulk');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'tickets': tickets,
          'totalAmount': totalPrice, // Gửi đúng tổng tiền người dùng phải trả
          if (promotionId != null) 'promotionId': promotionId,
          if (discountAmount != null) 'discountAmount': discountAmount,
        }),
      );

      if (response.statusCode == 201) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        final errorBody = jsonDecode(response.body);
        final errorMessage = errorBody['message'] ?? 'Tạo vé thất bại';
        throw Exception(errorMessage);
      }
    } catch (e) {
      throw Exception('Lỗi kết nối tới server: $e');
    }
  }

  /// Lấy thông tin chi tiết một vé theo ID
  static Future<Map<String, dynamic>> getTicketById(int ticketId) async {
    final Uri url = Uri.parse('$baseUrl/tickets/$ticketId');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        throw Exception('Không tìm thấy vé');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối khi lấy thông tin vé: $e');
    }
  }

  /// Lấy danh sách tất cả vé của người dùng
  static Future<List<dynamic>> getUserTickets(int userId) async {
    final Uri url = Uri.parse('$baseUrl/tickets/user/$userId');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      } else {
        throw Exception('Không thể tải danh sách vé');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối khi lấy danh sách vé: $e');
    }
  }

  /// Kiểm tra trạng thái thanh toán ZaloPay (Active Polling)
  static Future<bool> checkZaloPayStatus(int paymentHistoryId) async {
    final Uri url = Uri.parse('$baseUrl/tickets/$paymentHistoryId/check-zalopay');
    print('💰 [FRONTEND] Checking ZaloPay Status: $url');

    try {
      final response = await http.post(url);
      print('💰 [FRONTEND] Response Code: ${response.statusCode}');
      print('💰 [FRONTEND] Response Body: ${response.body}');

      if (response.statusCode == 201 || response.statusCode == 200) {
        final body = jsonDecode(response.body);
        return body['success'] == true;
      }
      return false;
    } catch (e) {
      print('❌ [FRONTEND] Error checking ZaloPay status: $e');
      debugPrint('Error checking ZaloPay status: $e');
      return false;
    }
  }
}