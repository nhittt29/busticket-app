// lib/bloc/auth/auth_bloc.dart
import 'dart:convert';
import 'dart:io';
import 'package:logger/logger.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart' as http;
import 'package:mime/mime.dart';
import 'package:http_parser/http_parser.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'auth_event.dart';
import 'auth_state.dart';

final logger = Logger();

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(const AuthState()) {
    on<LoginEvent>(_onLogin);
    on<RegisterEvent>(_onRegister);
    on<ForgotPasswordEvent>(_onForgotPassword);
    on<ResetPasswordEvent>(_onResetPassword);
    on<LoadUserEvent>(_onLoadUser);
    on<LogoutEvent>(_onLogout);
    on<UpdateUserEvent>(_onUpdateUser);
  }

  Future<void> _onLogin(LoginEvent event, Emitter<AuthState> emit) async {
    emit(state.copyWith(isLoading: true, success: false, error: null));
    logger.i('State before login: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3000/api/auth/login'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": event.email, "password": event.password}),
      );
      final responseBody = jsonDecode(response.body);
      if (response.statusCode == 200) {
        if (responseBody['user']['avatar'] != null &&
            !responseBody['user']['avatar'].toString().startsWith('http')) {
          responseBody['user']['avatar'] = 'http://10.0.2.2:3000/${responseBody['user']['avatar']}';
        }
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('idToken', responseBody['idToken']);
        await prefs.setString('uid', responseBody['uid']);
        await prefs.setString('user', jsonEncode(responseBody['user']));

        final userId = responseBody['user']['id'] as int; // LẤY userId

        emit(state.copyWith(
          isLoading: false,
          success: true,
          message: "Đăng nhập thành công",
          user: responseBody['user'],
          userId: userId, // GÁN userId
        ));
      } else {
        throw Exception(responseBody['message'] ?? "Sai email hoặc mật khẩu");
      }
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
    logger.i('State after login: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}, userId=${state.userId}');
  }

  Future<void> _onRegister(RegisterEvent event, Emitter<AuthState> emit) async {
    emit(state.copyWith(isLoading: true, success: false, error: null));
    logger.i('State before register: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
    try {
      var uri = Uri.parse('http://10.0.2.2:3000/api/auth/register');
      var request = http.MultipartRequest('POST', uri);
      request.fields['email'] = event.email;
      request.fields['password'] = event.password;
      request.fields['name'] = event.name;
      request.fields['phone'] = event.phone ?? '';
      request.fields['dob'] = event.dob != null
          ? event.dob!.toIso8601String().split('T')[0]
          : '';
      request.fields['gender'] = event.gender ?? 'OTHER';
      if (event.avatarPath != null && event.avatarPath!.isNotEmpty) {
        final file = File(event.avatarPath!);
        if (await file.exists()) {
          final mimeType = lookupMimeType(file.path) ?? 'image/*';
          request.files.add(await http.MultipartFile.fromPath(
            'avatar',
            file.path,
            contentType: MediaType.parse(mimeType),
          ));
        } else {
          logger.w('File avatar not found: ${event.avatarPath}');
        }
      }
      final response = await request.send();
      final body = await response.stream.bytesToString();
      if (response.statusCode == 201) {
        final data = jsonDecode(body);
        if (data['avatar'] != null && !data['avatar'].toString().startsWith('http')) {
          data['avatar'] = 'http://10.0.2.2:3000/${data['avatar']}';
        }
        final prefs = await SharedPreferences.getInstance();
        await prefs.clear();
        emit(state.copyWith(
          isLoading: false,
          success: true,
          message: "Đăng ký thành công",
          user: null,
          userId: null,
        ));
      } else {
        throw Exception("Đăng ký thất bại: ${jsonDecode(body)['message'] ?? body}");
      }
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
    logger.i('State after register: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
  }

  Future<void> _onForgotPassword(ForgotPasswordEvent event, Emitter<AuthState> emit) async {
    emit(state.copyWith(isLoading: false, success: true, message: "Email hợp lệ. Tiếp tục đặt mật khẩu mới."));
  }

  Future<void> _onResetPassword(ResetPasswordEvent event, Emitter<AuthState> emit) async {
    emit(state.copyWith(isLoading: true, success: false, error: null));
    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3000/api/auth/reset-password'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "email": event.email,
          "newPassword": event.newPassword,
        }),
      );
      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.clear();
        emit(state.copyWith(
          isLoading: false,
          success: true,
          message: "Đặt lại mật khẩu thành công",
          user: null,
          userId: null,
        ));
      } else {
        throw Exception("Không thể reset mật khẩu: ${response.body}");
      }
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
  }

  Future<void> _onLoadUser(LoadUserEvent event, Emitter<AuthState> emit) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userString = prefs.getString('user');
      if (userString != null) {
        final userData = jsonDecode(userString);
        if (userData['avatar'] != null && !userData['avatar'].toString().startsWith('http')) {
          userData['avatar'] = 'http://10.0.2.2:3000/${userData['avatar']}';
        }
        final userId = userData['id'] as int;
        emit(state.copyWith(
          isLoading: false,
          success: true,
          user: userData,
          userId: userId,
        ));
      } else {
        emit(state.copyWith(isLoading: false, user: null, userId: null));
      }
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
  }

  Future<void> _onLogout(LogoutEvent event, Emitter<AuthState> emit) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      await DefaultCacheManager().emptyCache();
      emit(state.copyWith(
        isLoading: false,
        success: true,
        message: "Đăng xuất thành công",
        user: null,
        userId: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
  }

  Future<void> _onUpdateUser(UpdateUserEvent event, Emitter<AuthState> emit) async {
    emit(state.copyWith(isLoading: true, success: false, error: null));
    logger.i('Starting _onUpdateUser with event: $event');
    try {
      final prefs = await SharedPreferences.getInstance();
      final idToken = prefs.getString('idToken');
      final user = state.user;
      logger.i('idToken: $idToken, user: $user');
      if (idToken == null || user == null) {
        throw Exception('Không tìm thấy token hoặc thông tin người dùng');
      }
      if (user['id'] == null) {
        throw Exception('ID người dùng không tồn tại');
      }
      var uri = Uri.parse('http://10.0.2.2:3000/api/auth/update-profile');
      var request = http.MultipartRequest('PUT', uri);
      request.headers['Authorization'] = 'Bearer $idToken';
      final userId = int.tryParse(user['id'].toString()) ?? 0;
      if (userId == 0) {
        throw Exception('ID người dùng không hợp lệ');
      }
      request.fields['id'] = userId.toString();
      request.fields['name'] = event.name;
      request.fields['phone'] = event.phone ?? '';
      request.fields['dob'] = event.dob != null
          ? event.dob!.toIso8601String().split('T')[0]
          : '';
      request.fields['gender'] = event.gender ?? 'OTHER';
      logger.i('Request fields: ${request.fields}');
      if (event.avatarPath != null && event.avatarPath!.isNotEmpty) {
        final file = File(event.avatarPath!);
        if (await file.exists()) {
          final mimeType = lookupMimeType(file.path) ?? 'image/*';
          request.files.add(await http.MultipartFile.fromPath(
            'avatar',
            file.path,
            contentType: MediaType.parse(mimeType),
          ));
          logger.i('Added avatar file: ${file.path}, mimeType: $mimeType');
        } else {
          logger.w('File avatar not found: ${event.avatarPath}');
          emit(state.copyWith(isLoading: false, error: 'File ảnh không tồn tại, vui lòng chọn lại.'));
          return;
        }
      }
      final response = await request.send();
      final body = await response.stream.bytesToString();
      logger.i('Response status: ${response.statusCode}, body: $body');
      if (response.statusCode == 200) {
        final updatedUser = jsonDecode(body);
        if (updatedUser['avatar'] != null && !updatedUser['avatar'].toString().startsWith('http')) {
          updatedUser['avatar'] = 'http://10.0.2.2:3000/${updatedUser['avatar']}';
        }
        await prefs.setString('user', jsonEncode(updatedUser));
        emit(state.copyWith(
          isLoading: false,
          success: true,
          message: 'Cập nhật thông tin thành công',
          user: updatedUser,
          userId: updatedUser['id'] as int,
        ));
      } else {
        throw Exception('Cập nhật thất bại: ${jsonDecode(body)['message'] ?? body}');
      }
    } catch (e) {
      logger.e('Error in _onUpdateUser: $e');
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
    logger.i('State after _onUpdateUser: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
  }
}