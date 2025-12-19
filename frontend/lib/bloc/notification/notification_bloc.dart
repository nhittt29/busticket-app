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
      
      // Load Active (Delivered) - Android Only
      final androidPlugin = plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
      List<ActiveNotification>? activeList;
      if (androidPlugin != null) {
          try {
             activeList = await androidPlugin.getActiveNotifications();
          } catch (_) {}
      }

      final prefs = await SharedPreferences.getInstance();
      final currentUserId = prefs.getInt('reminder_current_user_id');
      if (currentUserId == null) return 0;

      // Lấy danh sách ID đã đọc
      final readIds = prefs.getStringList('read_notifications') ?? [];

      final Set<int> unreadIds = {};

      // 1. Process Pending (Filter Future)
      for (var noti in pending) {
        if (readIds.contains(noti.id.toString())) continue;
        
        // Filter Future
        try {
           final payload = noti.payload ?? '';
           final parts = payload.split('|');
           if (parts.length > 1) {
              final millis = int.tryParse(parts[1]);
              if (millis != null) {
                 final notifyTime = DateTime.fromMillisecondsSinceEpoch(millis);
                 if (notifyTime.isAfter(DateTime.now())) {
                    continue; // Skip future
                 }
              }
           }
        } catch (_) {}

        // Check User
        final int userPart;
        if (noti.id >= 2000000) {
          userPart = (noti.id - 2000000) ~/ 100000;
        } else if (noti.id >= 900000) {
          userPart = (noti.id - 900000) ~/ 100000;
        } else {
          userPart = noti.id ~/ 100000;
        }

        if (userPart == currentUserId) {
          unreadIds.add(noti.id);
        }
      }

      // 2. Process Active (Always Count)
      if (activeList != null) {
        for (var active in activeList) {
           final id = active.id ?? 0;
           if (readIds.contains(id.toString())) continue;
           
           // Check User
           final int userPart;
           if (id >= 2000000) {
             userPart = (id - 2000000) ~/ 100000;
           } else if (id >= 900000) {
             userPart = (id - 900000) ~/ 100000;
           } else {
             userPart = id ~/ 100000;
           }
              
           if (userPart == currentUserId) {
              unreadIds.add(id);
           }
        }
      }

      return unreadIds.length;
    } catch (e) {
      return 0;
    }
  }
}