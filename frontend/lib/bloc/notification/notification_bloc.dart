import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'notification_event.dart';
import 'notification_state.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  NotificationBloc() : super(const NotificationState(unreadCount: 0)) { 
    on<LoadNotificationsEvent>(_onLoad);
    on<MarkAllAsReadEvent>(_onMarkAllAsRead);
  }

  Future<void> _onLoad(LoadNotificationsEvent event, Emitter<NotificationState> emit) async {
    final count = await _getUnreadCount();
    emit(state.copyWith(unreadCount: count));
  }

  // SỬA TÊN HÀM ĐÚNG VỚI EVENT
  Future<void> _onMarkAllAsRead(MarkAllAsReadEvent event, Emitter<NotificationState> emit) async {
    emit(state.copyWith(unreadCount: 0));
  }

  /// Tính số thông báo chưa đọc của user hiện tại
  Future<int> _getUnreadCount() async {
    try {
      final plugin = FlutterLocalNotificationsPlugin();
      final pending = await plugin.pendingNotificationRequests();

      final prefs = await SharedPreferences.getInstance();
      final currentUserId = prefs.getInt('reminder_current_user_id');
      if (currentUserId == null) return 0;

      int count = 0;
      for (var noti in pending) {
        final userPart = noti.id >= 900000
            ? (noti.id - 900000) ~/ 100000
            : noti.id ~/ 100000;

        if (userPart == currentUserId) {
          count++;
        }
      }
      return count;
    } catch (e) {
      return 0;
    }
  }
}