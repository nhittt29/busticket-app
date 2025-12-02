import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/review.dart';

class ReviewApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/api/reviews';

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('idToken');
  }

  static Future<List<Review>> getReviewsByBus(int busId) async {
    final response = await http.get(Uri.parse('$baseUrl/bus/$busId'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Review.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load reviews');
    }
  }

  static Future<Map<String, dynamic>> getStats(int busId) async {
    final response = await http.get(Uri.parse('$baseUrl/stats/$busId'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load stats');
    }
  }

  static Future<Review> createReview(int ticketId, int rating, String comment) async {
    final token = await _getToken();
    if (token == null) throw Exception('Unauthorized');

    final response = await http.post(
      Uri.parse(baseUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'ticketId': ticketId,
        'rating': rating,
        'comment': comment,
      }),
    );

    if (response.statusCode == 201) {
      return Review.fromJson(jsonDecode(response.body));
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Failed to create review');
    }
  }

  static Future<Review> updateReview(int id, int rating, String comment) async {
    final token = await _getToken();
    if (token == null) throw Exception('Unauthorized');

    final response = await http.put(
      Uri.parse('$baseUrl/$id'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'rating': rating,
        'comment': comment,
      }),
    );

    if (response.statusCode == 200) {
      return Review.fromJson(jsonDecode(response.body));
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Failed to update review');
    }
  }

  static Future<void> deleteReview(int id) async {
    final token = await _getToken();
    if (token == null) throw Exception('Unauthorized');

    final response = await http.delete(
      Uri.parse('$baseUrl/$id'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode != 200) {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Failed to delete review');
    }
  }
}
