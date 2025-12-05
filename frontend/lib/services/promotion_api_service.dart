import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class PromotionApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/promotions';

  static Future<List<Map<String, dynamic>>> getActivePromotions() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('idToken');
      
      final response = await http.get(
        Uri.parse(baseUrl),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        return [];
      }
    } catch (e) {
      print('Error fetching promotions: $e');
      return [];
    }
  }
}
