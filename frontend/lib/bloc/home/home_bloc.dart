// lib/bloc/home/home_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'home_event.dart';
import 'home_state.dart';
import '../../repositories/user_repository.dart';
import '../../services/promotion_api_service.dart';
import '../../services/reminder_service.dart';
import '../../ticket/services/ticket_api_service.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final UserRepository _userRepository = UserRepository();

  HomeBloc() : super(const HomeState()) {
    on<LoadUserEvent>(_onLoadUser);
    on<LogoutEvent>(_onLogout);
    on<ClearTicketIdEvent>(_onClearTicketId);
    on<SetTicketIdEvent>(_onSetTicketId);
    on<SetNewTicketEvent>(_onSetNewTicket);
    on<RefreshNotificationsEvent>(_onRefreshNotifications);
    on<LoadHomeDataEvent>(_onLoadHomeData);
  }

  Future<void> _onLoadHomeData(LoadHomeDataEvent event, Emitter<HomeState> emit) async {
    // Keep loading true only if necessary, or just load quietly in background
    // emit(state.copyWith(loading: true)); 
    try {
      final userId = state.user?['id'];
      
      // 1. Load Promotions
      final promotions = await PromotionApiService.getActivePromotions();

      // 2. Load Upcoming Trip (if user logged in)
      Map<String, dynamic>? upcomingTrip;
      if (userId != null) {
        final tickets = await TicketApiService.getUserTickets(userId as int);
        // Filter: BOOKED or PAID, and departure time > now
        final now = DateTime.now();
        final futureTickets = tickets.where((t) {
           final status = t['status'] as String? ?? '';
           final depTime = DateTime.tryParse(t['schedule']?['departureAt']?.toString() ?? '');
           return (status == 'BOOKED' || status == 'PAID') && 
                  depTime != null && depTime.isAfter(now);
        }).toList();

        // Sort by departure time ascending
        futureTickets.sort((a, b) {
           final da = DateTime.parse(a['schedule']['departureAt']);
           final db = DateTime.parse(b['schedule']['departureAt']);
           return da.compareTo(db);
        });

        if (futureTickets.isNotEmpty) {
           upcomingTrip = futureTickets.first;
        }
      }

      emit(state.copyWith(
        promotions: promotions,
        upcomingTrip: upcomingTrip,
      ));

    } catch (e) {
      print('LoadHomeData error: $e');
      // Don't block UI on error
    }
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

        // Check for unreviewed tickets and show notification
        try {
           // We ignore result, just trigger it
           ReminderService().checkAndShowUnreviewedNotification();
        } catch (_) {}
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
      await _userRepository.clearUser();
      await DefaultCacheManager().emptyCache();
      emit(state.copyWith(loading: false, user: null));
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));
    }
  }

  void _onClearTicketId(ClearTicketIdEvent event, Emitter<HomeState> emit) {
    emit(state.copyWith(ticketId: null));
  }

  void _onSetTicketId(SetTicketIdEvent event, Emitter<HomeState> emit) {
    emit(state.copyWith(ticketId: event.ticketId));
  }

  void _onSetNewTicket(SetNewTicketEvent event, Emitter<HomeState> emit) {
    emit(state.copyWith(newTicketData: event.ticketData));
  }

  // ĐÃ THÊM HÀM XỬ LÝ – KHI NHẬN EVENT THÌ TỰ ĐỘNG RELOAD THÔNG BÁO
  void _onRefreshNotifications(RefreshNotificationsEvent event, Emitter<HomeState> emit) {
    // Chỉ cần emit một state mới là đủ → NotificationScreen sẽ tự reload nhờ BlocListener
    emit(state.copyWith());
  }
}