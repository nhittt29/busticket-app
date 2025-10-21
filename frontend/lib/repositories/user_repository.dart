import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class UserRepository {
  static const String _userKey = 'user';

  Future<void> saveUser(Map<String, String> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(userData));
  }

  Future<Map<String, dynamic>?> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString(_userKey);
    return userString != null ? jsonDecode(userString) as Map<String, dynamic> : null;
  }

  Future<void> clearUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}