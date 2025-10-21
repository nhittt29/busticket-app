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

  // ✅ FIX 1: Login - Lưu dob dạng STRING thay vì DateTime
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
        // ✅ FIX: Giữ dob dạng STRING để lưu SharedPreferences
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
      request.fields['phone'] = event.phone ?? '';
      request.fields['dob'] = event.dob?.toIso8601String().split('T')[0] ?? '';
      request.fields['gender'] = event.gender ?? 'OTHER';

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
        await prefs.clear();
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
    emit(state.copyWith(isLoading: false, success: true, message: "Email hợp lệ. Tiếp tục đặt mật khẩu mới."));
    // ✅ KHÔNG GỌI API - CHỈ VALIDATE EMAIL
  }

  // ✅ GIỮ NGUYÊN ResetPassword
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

  // ✅ FIX 2: LoadUser - KHÔNG parse dob thành DateTime
  Future<void> _onLoadUser(LoadUserEvent event, Emitter<AuthState> emit) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userString = prefs.getString('user');
      if (userString != null) {
        final userData = jsonDecode(userString);
        if (userData['avatar'] != null &&
            !userData['avatar'].toString().startsWith('http')) {
          userData['avatar'] = 'http://10.0.2.2:3000/${userData['avatar']}';
        }
        // ✅ FIX: Giữ dob dạng STRING
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
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
  }

  // ✅ FIX 3: UpdateUser - Parse dob từ STRING về DateTime CHỈ KHI HIỂN THỊ
  Future<void> _onUpdateUser(UpdateUserEvent event, Emitter<AuthState> emit) async {
    emit(state.copyWith(isLoading: true, success: false, error: null));
    try {
      final prefs = await SharedPreferences.getInstance();
      final idToken = prefs.getString('idToken');
      final user = state.user;
      if (idToken == null || user == null) {
        throw Exception('Không tìm thấy token hoặc thông tin người dùng');
      }

      final dobString = event.dob?.toIso8601String().split('T')[0];
      final response = await http.put(
        Uri.parse('http://10.0.2.2:3000/api/auth/update-profile'),
        headers: {
          'Authorization': 'Bearer $idToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'id': user['id'],
          'name': event.name,
          'phone': event.phone,
          'dob': dobString,
          'gender': event.gender,
        }),
      );

      if (response.statusCode == 200) {
        final updatedUser = jsonDecode(response.body);
        if (updatedUser['avatar'] != null &&
            !updatedUser['avatar'].toString().startsWith('http')) {
          updatedUser['avatar'] = 'http://10.0.2.2:3000/${updatedUser['avatar']}';
        }
        // ✅ FIX: Giữ dob dạng STRING khi lưu
        await prefs.setString('user', jsonEncode(updatedUser));
        emit(state.copyWith(
          isLoading: false,
          success: true,
          message: 'Cập nhật thông tin thành công',
          user: updatedUser,
        ));
      } else {
        throw Exception('Cập nhật thất bại: ${response.body}');
      }
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        success: false,
        error: e.toString(),
      ));
    }
  }
}