import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'home_event.dart';
import 'home_state.dart';
import '../../repositories/user_repository.dart'; // Cập nhật đường dẫn

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final UserRepository _userRepository = UserRepository(); // Khởi tạo đúng

  HomeBloc() : super(const HomeState()) {
    on<LoadUserEvent>(_onLoadUser);
    on<LogoutEvent>(_onLogout);
  }

  Future<void> _onLoadUser(LoadUserEvent event, Emitter<HomeState> emit) async {
    emit(state.copyWith(loading: true));
    try {
      final userData = await _userRepository.loadUser();

      if (userData != null) {
        String? avatar = userData['avatar'];
        if (avatar != null && avatar.isNotEmpty) {
          avatar = avatar.replaceAll("\\", "/");
          if (!avatar.startsWith('http')) {
            avatar = 'http://10.0.2.2:3000/$avatar';
          }
        } else {
          avatar = 'assets/images/default.png';
        }

        userData['avatar'] = avatar;
        emit(state.copyWith(loading: false, user: userData));
      } else {
        emit(state.copyWith(loading: false, user: null)); // Sửa thành false
      }
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));
    }
  }

  Future<void> _onLogout(LogoutEvent event, Emitter<HomeState> emit) async {
    emit(state.copyWith(loading: true));
    try {
      await _userRepository.clearUser();
      await DefaultCacheManager().emptyCache();
      emit(state.copyWith(loading: false, user: null));
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));
    }
  }
}