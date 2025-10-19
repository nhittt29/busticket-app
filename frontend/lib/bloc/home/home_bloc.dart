import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'home_event.dart';
import 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  HomeBloc() : super(const HomeState()) {
    on<LoadUserEvent>(_onLoadUser);
    on<LogoutEvent>(_onLogout);
  }

  Future<void> _onLoadUser(LoadUserEvent event, Emitter<HomeState> emit) async {
    emit(state.copyWith(loading: true));
    try {
      final prefs = await SharedPreferences.getInstance();
      final userString = prefs.getString('user');

      if (userString != null) {
        final userData = jsonDecode(userString);

        // ✅ Chuẩn hóa đường dẫn avatar (xử lý cả khi là null hoặc có dấu \\)
        String? avatar = userData['avatar'];
        if (avatar != null && avatar.isNotEmpty) {
          avatar = avatar.replaceAll("\\", "/");
          if (!avatar.startsWith('http')) {
            avatar = 'http://10.0.2.2:3000/$avatar';
          }
        } else {
          // fallback nếu không có ảnh
          avatar = 'assets/images/default.png';
        }

        userData['avatar'] = avatar;

        emit(state.copyWith(loading: false, user: userData));
      } else {
        emit(state.copyWith(loading: false, user: null));
      }
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));
    }
  }

  Future<void> _onLogout(LogoutEvent event, Emitter<HomeState> emit) async {
    emit(state.copyWith(loading: true));
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      await DefaultCacheManager().emptyCache();
      emit(state.copyWith(loading: false, user: null));
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));
    }
  }
}
