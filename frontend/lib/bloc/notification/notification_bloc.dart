import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../repositories/notification_repository.dart';
import 'notification_event.dart';
import 'notification_state.dart';

class NotificationBloc extends Bloc<NotificationEvent, NotificationState> {
  final NotificationRepository _repository = NotificationRepository();

  NotificationBloc() : super(const NotificationState(unreadCount: 0)) { 
    on<LoadNotificationsEvent>(_onLoad);
    on<MarkAllAsReadEvent>(_onMarkAllAsRead);
  }

  Future<void> _onLoad(LoadNotificationsEvent event, Emitter<NotificationState> emit) async {
    // 1. Get Unread Count from Local
    int count = await _getUnreadCount();

    // 2. Get Server Notifications if userId is provided
    if (event.userId != null) {
      try {
        final serverNotis = await _repository.fetchNotifications(event.userId!);
        
        // Load local read IDs to filter server notis
        final prefs = await SharedPreferences.getInstance();
        final readIds = prefs.getStringList('read_notifications') ?? [];

        // Count unread server notis (Server says unread AND Local doesn't say read)
        final unreadServer = serverNotis.where((n) {
           final isUnread = n['isRead'] == false;
           final uiId = 3000000 + (n['id'] as int);
           return isUnread && !readIds.contains(uiId.toString());
        }).length;
        
        count += unreadServer;
      } catch (e) {
        // Ignore server error for unread count, just show local
      }
    }

    emit(state.copyWith(unreadCount: count));
  }

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
        
        // Filter Future (SKIP for Unreviewed Noti ID >= 2000000)
        if (noti.id < 2000000) {
          try {
             final payload = noti.payload ?? '';
             final parts = payload.split('|');
             if (parts.length > 1) {
                final millis = int.tryParse(parts[1]);
                if (millis != null) {
                   final notifyTime = DateTime.fromMillisecondsSinceEpoch(millis);
                   // Give 5 seconds buffer
                   if (notifyTime.isAfter(DateTime.now().add(const Duration(seconds: 5)))) {
                      continue; // Skip future
                   }
                }
             }
          } catch (_) {}
        }

        // Check User
        final int userPart;
        if (noti.id >= 2000000) {
          userPart = (noti.id - 2000000) ~/ 100000;
        } else if (noti.id >= 900000) {
          userPart = (noti.id - 900000) ~/ 100000;
        } else if (noti.id >= 800000) {
          userPart = (noti.id - 800000) ~/ 100000;
        } else if (noti.id >= 700000) {
          userPart = (noti.id - 700000) ~/ 100000;
        } else if (noti.id >= 500000) {
          userPart = (noti.id - 500000) ~/ 100000;
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
            } else if (id >= 800000) {
              userPart = (id - 800000) ~/ 100000;
            } else if (id >= 700000) {
              userPart = (id - 700000) ~/ 100000;
            } else if (id >= 500000) {
              userPart = (id - 500000) ~/ 100000;
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