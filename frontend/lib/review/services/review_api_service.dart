import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/review_model.dart';

class ReviewApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/api';

  static Future<List<dynamic>> getPendingReviews(int userId) async {
    final response = await http.get(Uri.parse('$baseUrl/reviews/pending/$userId'));

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load pending reviews');
    }
  }

  static Future<List<Review>> getUserReviews(int userId) async {
    final response = await http.get(Uri.parse('$baseUrl/reviews/user/$userId'));

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Review.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load user reviews');
    }
  }

  static Future<void> createReview({
    required int userId,
    required int ticketId,
    required int rating,
    String? comment,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/reviews'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'userId': userId,
        'ticketId': ticketId,
        'rating': rating,
        'comment': comment,
      }),
    );

    if (response.statusCode != 201) {
      throw Exception('Failed to submit review: ${response.body}');
    }
  }
}
