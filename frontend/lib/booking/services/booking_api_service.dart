// lib/booking/services/booking_api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../cubit/booking_state.dart';
import '../models/dropoff_point.dart';
import '../../models/route_model.dart';

class BookingApiService {
  static const String baseUrl = "http://10.0.2.2:3000/api";

  // Lấy danh sách tất cả các tuyến đường (để lấy danh sách địa điểm)
  static Future<List<RouteModel>> fetchRoutes() async {
    final url = Uri.parse('$baseUrl/routes');
    try {
      final response = await http.get(url);
      if (kDebugMode) debugPrint('ROUTES URL: $url - Status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => RouteModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load routes');
      }
    } catch (e) {
      if (kDebugMode) debugPrint('Error fetching routes: $e');
      return [];
    }
  }

  // Tìm kiếm chuyến xe
  static Future<List<Trip>> searchTrips(String from, String to, DateTime date) async {
    final formattedDate = '${date.day}/${date.month}/${date.year}';
    final url = Uri.parse('$baseUrl/schedules?startPoint=$from&endPoint=$to&date=$formattedDate');
    try {
      final response = await http.get(url);
      if (kDebugMode) {
        debugPrint('SEARCH URL: $url');
        debugPrint('RESPONSE: ${response.statusCode} - ${response.body}');
      }
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final trips = data.map((json) => Trip.fromJson(json)).toList();

        final now = DateTime.now();
        final vietnamTrips = trips.map((trip) {
          final departureUtc = DateTime.parse(trip.departure).toLocal();
          final arrivalUtc = DateTime.parse(trip.arrival).toLocal();
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
            startPoint: trip.startPoint,
            endPoint: trip.endPoint,
          );
        }).toList();

        vietnamTrips.sort((a, b) => DateTime.parse(a.departure).compareTo(DateTime.parse(b.departure)));
        return vietnamTrips;
      } else {
        throw Exception('Không tìm thấy chuyến: ${response.body}');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }

  // Lấy tất cả chuyến xe với bộ lọc nâng cao
  // Lấy tất cả chuyến xe với bộ lọc nâng cao (Có phân trang)
  static Future<PaginatedTrips> fetchAllSchedules({
    double? minPrice,
    double? maxPrice,
    String? startTime,
    String? endTime,
    String? busType,
    int? brandId,
    String? dropoffPoint,
    String? sortBy,
    int page = 1,
    int limit = 10,
  }) async {
    final queryParams = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (minPrice != null) queryParams['minPrice'] = minPrice.toString();
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
    if (startTime != null) queryParams['startTime'] = startTime;
    if (endTime != null) queryParams['endTime'] = endTime;
    if (busType != null) queryParams['busType'] = busType;
    if (brandId != null) queryParams['brandId'] = brandId.toString();
    if (dropoffPoint != null) queryParams['dropoffPoint'] = dropoffPoint;
    if (sortBy != null) queryParams['sortBy'] = sortBy;

    final uri = Uri.parse('$baseUrl/schedules').replace(queryParameters: queryParams);

    try {
      final response = await http.get(uri);
      if (kDebugMode) {
        debugPrint('EXPLORE URL: $uri');
        debugPrint('RESPONSE: ${response.statusCode}');
      }
      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
        final List<dynamic> data = jsonResponse['data'];
        final Map<String, dynamic>? meta = jsonResponse['meta'];
        final int total = (meta?['total'] as int?) ?? 0;
        final int page = (meta?['page'] as int?) ?? 1;
        final int limit = (meta?['limit'] as int?) ?? 10;

        final trips = data.map((json) => Trip.fromJson(json)).toList();
        
        final now = DateTime.now();
        final mappedTrips = trips.map((trip) {
          final departureUtc = DateTime.parse(trip.departure).toLocal();
          final arrivalUtc = DateTime.parse(trip.arrival).toLocal();
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
            startPoint: trip.startPoint,
            endPoint: trip.endPoint,
          );
        }).toList();

        return PaginatedTrips(
          trips: mappedTrips,
          total: total,
          page: page,
          limit: limit,
        );
      } else {
        throw Exception('Lỗi tải danh sách chuyến: ${response.body}');
      }
    } catch (e) {
      throw Exception('Lỗi kết nối: $e');
    }
  }


  // Lấy danh sách ghế theo lịch trình
  static Future<List<Seat>> getSeats(int scheduleId) async {
    final url = Uri.parse('$baseUrl/seats/by-schedule/$scheduleId');
    try {
      final response = await http.get(url);
      if (kDebugMode) {
        debugPrint('SEATS URL: $url');
        debugPrint('RESPONSE: ${response.statusCode} - ${response.body}');
      }
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

  // ĐÃ SỬA ĐÚNG URL THEO BACKEND: /api/schedules/:id/dropoff-points
  static Future<List<DropoffPoint>> getDropoffPoints(int scheduleId) async {
    final url = Uri.parse('$baseUrl/schedules/$scheduleId/dropoff-points');
    try {
      final response = await http.get(url);
      if (kDebugMode) {
        debugPrint('DROPOFF POINTS URL: $url');
        debugPrint('RESPONSE: ${response.statusCode} - ${response.body}');
      }
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => DropoffPoint.fromJson(json)).toList();
      }
      return []; // nếu không có điểm trả thì trả về rỗng → sẽ mặc định bến xe
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Lỗi lấy điểm trả: $e');
      }
      return [];
    }
  }
}

class PaginatedTrips {
  final List<Trip> trips;
  final int total;
  final int page;
  final int limit;

  PaginatedTrips({
    required this.trips,
    required this.total,
    required this.page,
    required this.limit,
  });
}
