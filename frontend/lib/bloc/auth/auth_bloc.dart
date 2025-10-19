import 'dart:convert';
import 'dart:io';
import 'package:logger/logger.dart'; // Sử dụng logger
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

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['user']['avatar'] != null &&
            !data['user']['avatar'].toString().startsWith('http')) {
          data['user']['avatar'] = 'http://10.0.2.2:3000/${data['user']['avatar']}';
        }
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('idToken', data['idToken']);
        await prefs.setString('uid', data['uid']);
        await prefs.setString('user', jsonEncode(data['user']));

        emit(state.copyWith(
          isLoading: false,
          success: true,
          message: "Đăng nhập thành công",
          user: data['user'],
        ));
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? "Sai email hoặc mật khẩu");
      }
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
    logger.i('State after login: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
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
      request.fields['phone'] = event.phone;

      if (event.avatarPath != null) {
        final file = File(event.avatarPath!);
        final mimeType = lookupMimeType(file.path) ?? 'image/*';
        request.files.add(await http.MultipartFile.fromPath(
          'avatar',
          file.path,
          contentType: MediaType.parse(mimeType),
        ));
      }

      final response = await request.send();
      final body = await response.stream.bytesToString();

      if (response.statusCode == 201) {
        final data = jsonDecode(body);
        if (data['avatar'] != null &&
            !data['avatar'].toString().startsWith('http')) {
          data['avatar'] = 'http://10.0.2.2:3000/${data['avatar']}';
        }
        final prefs = await SharedPreferences.getInstance();
        await prefs.clear(); // Xóa toàn bộ SharedPreferences sau đăng ký
        emit(state.copyWith(
          isLoading: false,
          success: true,
          message: "Đăng ký thành công",
          user: null,
        ));
      } else {
        throw Exception(
            "Đăng ký thất bại: ${jsonDecode(body)['message'] ?? body}");
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
    emit(state.copyWith(isLoading: true, success: false, error: null));
    logger.i('State before forgot password: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:3000/api/auth/forgot-password'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"email": event.email}),
      );

      if (response.statusCode == 200) {
        emit(state.copyWith(
          isLoading: false,
          success: true,
          message: "Email đặt lại mật khẩu đã được gửi",
        ));
      } else {
        throw Exception("Không thể gửi email reset mật khẩu: ${response.body}");
      }
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
    logger.i('State after forgot password: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
  }

  Future<void> _onResetPassword(ResetPasswordEvent event, Emitter<AuthState> emit) async {
    emit(state.copyWith(isLoading: true, success: false, error: null));
    logger.i('State before reset password: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
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
        await prefs.clear(); // Xóa toàn bộ SharedPreferences sau khi đặt lại mật khẩu
        emit(state.copyWith(
          isLoading: false,
          success: true,
          message: "Đặt lại mật khẩu thành công",
          user: null, // Đảm bảo không giữ user
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
    logger.i('State after reset: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
  }

  Future<void> _onLoadUser(LoadUserEvent event, Emitter<AuthState> emit) async {
    emit(state.copyWith(isLoading: true, success: false, error: null));
    logger.i('State before load user: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
    try {
      final prefs = await SharedPreferences.getInstance();
      final userString = prefs.getString('user');
      if (userString != null) {
        final userData = jsonDecode(userString);
        if (userData['avatar'] != null &&
            !userData['avatar'].toString().startsWith('http')) {
          userData['avatar'] = 'http://10.0.2.2:3000/${userData['avatar']}';
        }
        emit(state.copyWith(
          isLoading: false,
          success: true,
          user: userData,
        ));
      } else {
        emit(state.copyWith(isLoading: false, user: null));
      }
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
    logger.i('State after load user: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
  }

  Future<void> _onLogout(LogoutEvent event, Emitter<AuthState> emit) async {
    emit(state.copyWith(isLoading: true, success: false, error: null));
    logger.i('State before logout: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      await DefaultCacheManager().emptyCache();
      emit(state.copyWith(
        isLoading: false,
        success: true,
        message: "Đăng xuất thành công",
        user: null,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
    logger.i('State after logout: isLoading=${state.isLoading}, success=${state.success}, user=${state.user}');
  }
}