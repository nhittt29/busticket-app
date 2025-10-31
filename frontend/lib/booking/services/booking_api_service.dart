// lib/booking/services/booking_api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../cubit/booking_state.dart';

class BookingApiService {
  static const String baseUrl = "http://10.0.2.2:3001";

  static Future<List<Trip>> searchTrips(String from, String to, DateTime date) async {
    final url = Uri.parse(
      '$baseUrl/schedules?startPoint=$from&endPoint=$to&date=${_formatDate(date)}',
    );

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Trip.fromJson(json)).toList();
      } else {
        throw Exception('Không tìm thấy chuyến: ${response.body}');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }

  static Future<List<Seat>> getSeats(int scheduleId) async {
    final url = Uri.parse('$baseUrl/schedules/$scheduleId/seats');
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Seat.fromJson(json)).toList();
      } else {
        throw Exception('Lỗi tải ghế: ${response.body}');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }

  static String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }
}