import 'dart:convert';
import 'package:http/http.dart' as http;
class NotificationRepository {
  static const String baseUrl = "http://10.0.2.2:3000/api";

  Future<List<Map<String, dynamic>>> fetchNotifications(int userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications/$userId'),
        headers: {"Content-Type": "application/json"},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Failed to load notifications');
      }
    } catch (e) {
      throw Exception('Error fetching notifications: $e');
    }
  }

  Future<bool> markAsRead(int notificationId, int userId) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/notifications/$notificationId/read/$userId'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({}),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
