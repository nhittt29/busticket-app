import 'dart:convert';
import 'package:http/http.dart' as http;
import '../cubit/booking_state.dart';

class BookingApiService {
  static const String baseUrl = "http://10.0.2.2:3000/api"; // ĐÚNG PORT 3000

  static Future<List<Trip>> searchTrips(String from, String to, DateTime date) async {
    // GỬI ĐÚNG ĐỊNH DẠNG DD/MM/YYYY CHO BACKEND
    final formattedDate = '${date.day}/${date.month}/${date.year}';
    final url = Uri.parse(
      '$baseUrl/schedules?startPoint=$from&endPoint=$to&date=$formattedDate',
    );
    try {
      final response = await http.get(url);
      print('SEARCH URL: $url');
      print('RESPONSE: ${response.statusCode} - ${response.body}');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final trips = data.map((json) => Trip.fromJson(json)).toList();

        // CHUYỂN GIỜ UTC → GIỜ VIỆT NAM (+07:00)
        final now = DateTime.now();
        final vietnamTrips = trips.map((trip) {
          final departureUtc = DateTime.parse(trip.departure).toLocal();
          final arrivalUtc = DateTime.parse(trip.arrival).toLocal();

          // TÍNH TRẠNG THÁI "SẮP KHỞI HÀNH" (< 60 PHÚT)
          final timeLeft = departureUtc.difference(now);
          final isNear = timeLeft.inMinutes > 0 && timeLeft.inMinutes < 60;

          return Trip(
            id: trip.id,
            busName: trip.busName,
            departure: departureUtc.toIso8601String(),
            arrival: arrivalUtc.toIso8601String(),
            price: trip.price,
            category: trip.category,
            seatType: trip.seatType,
            status: isNear
                ? 'NEAR_DEPARTURE'
                : trip.status == 'FULL'
                    ? 'FULL'
                    : trip.status == 'FEW_SEATS'
                        ? 'FEW_SEATS'
                        : 'UPCOMING',
          );
        }).toList();

        // SẮP XẾP THEO GIỜ ĐI (SỚM → MUỘN)
        vietnamTrips.sort((a, b) {
          final da = DateTime.parse(a.departure);
          final db = DateTime.parse(b.departure);
          return da.compareTo(db);
        });

        return vietnamTrips;
      } else {
        throw Exception('Không tìm thấy chuyến: ${response.body}');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }

  // ĐÚNG: GỌI /seats/by-schedule/:id
  static Future<List<Seat>> getSeats(int scheduleId) async {
    final url = Uri.parse('$baseUrl/seats/by-schedule/$scheduleId');
    try {
      final response = await http.get(url);
      print('SEATS URL: $url');
      print('RESPONSE: ${response.statusCode} - ${response.body}');
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final List<dynamic> seatsJson = data['seats'];
        return seatsJson.map((json) => Seat.fromJson(json)).toList();
      } else {
        throw Exception('Lỗi tải ghế: ${response.body}');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }
}