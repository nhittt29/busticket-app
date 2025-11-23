// lib/screens/notification_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

const Color primaryGradientStart = Color(0xFF6AB7F5);
const Color primaryGradientEnd = Color(0xFF4A9EFF);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color cardColor = Colors.white;
const Color deepBlue = Color(0xFF023E8A);

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  List<PendingNotificationRequest> pendingNotifications = [];
  final Map<int, bool> _readStatus = {};
  int? _currentUserId;

  @override
  void initState() {
    super.initState();
    _loadCurrentUserIdAndNotifications();
  }

  Future<void> _loadCurrentUserIdAndNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    _currentUserId = prefs.getInt('reminder_current_user_id');

    await _loadPendingNotifications();
  }

  Future<void> _loadPendingNotifications() async {
    tz.initializeTimeZones();
    tz.setLocalLocation(tz.getLocation('Asia/Ho_Chi_Minh'));

    final plugin = FlutterLocalNotificationsPlugin();
    final allPending = await plugin.pendingNotificationRequests();

    // SỬA CHÍNH XÁC 100% – DÙNG CÔNG THỨC NHÚNG USER ID ĐÃ ĐƯỢC DÙNG TRONG ReminderService
    final filtered = allPending.where((noti) {
      if (_currentUserId == null) return false;

      int userPart;
      if (noti.id >= 900000) {
        // Thông báo đặt vé thành công: +900000
        userPart = (noti.id - 900000) ~/ 100000;
      } else {
        // Nhắc nhở khởi hành: không +900000
        userPart = noti.id ~/ 100000;
      }

      final match = userPart == _currentUserId;
      if (kDebugMode && match) {
        debugPrint('NOTIFICATION_SCREEN: HIỆN THÔNG BÁO ID ${noti.id} → userPart: $userPart == currentUser: $_currentUserId');
      }
      return match;
    }).toList();

    if (kDebugMode) {
      debugPrint('NOTIFICATION_SCREEN: TỔNG PENDING: ${allPending.length} → LỌC ĐƯỢC: ${filtered.length} (userId: $_currentUserId)');
    }

    filtered.sort((a, b) => b.id.compareTo(a.id));

    if (!mounted) return;

    setState(() {
      pendingNotifications = filtered;
      for (var noti in filtered) {
        _readStatus.putIfAbsent(noti.id, () => false);
      }
    });
  }

  void _markAllAsRead() {
    if (_readStatus.values.any((read) => !read)) {
      setState(() {
        _readStatus.updateAll((key, value) => true);
      });
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: const Text('Đã đánh dấu tất cả là đã đọc', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
            backgroundColor: primaryGradientEnd,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            margin: const EdgeInsets.all(20),
            duration: const Duration(seconds: 2),
          ),
        );
    }
  }

  Future<void> _cancelAll() async {
    final plugin = FlutterLocalNotificationsPlugin();
    for (var noti in pendingNotifications) {
      await plugin.cancel(noti.id);
    }
    setState(() {
      pendingNotifications.clear();
      _readStatus.clear();
    });
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: const Text('Đã xóa tất cả thông báo', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
          backgroundColor: primaryGradientEnd,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: const EdgeInsets.all(20),
          duration: const Duration(seconds: 3),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _readStatus.values.where((read) => !read).length;

    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [primaryGradientStart, primaryGradientEnd],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Thông báo',
              style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: 0.5),
            ),
            if (unreadCount > 0) ...[
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(20)),
                constraints: const BoxConstraints(minWidth: 24),
                child: Text(
                  '$unreadCount',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ],
        ),
        actions: pendingNotifications.isNotEmpty
            ? [
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 28),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  offset: const Offset(0, 56),
                  itemBuilder: (context) => [
                    if (unreadCount > 0)
                      const PopupMenuItem(
                        value: 'read_all',
                        child: Row(
                          children: [
                            Icon(Icons.done_all, color: deepBlue),
                            SizedBox(width: 12),
                            Text('Đánh dấu đã đọc tất cả', style: TextStyle(fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    const PopupMenuItem(
                      value: 'clear_all',
                      child: Row(
                        children: [
                          Icon(Icons.delete_sweep, color: Colors.redAccent),
                          SizedBox(width: 12),
                          Text('Xóa tất cả thông báo', style: TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ],
                  onSelected: (value) {
                    if (value == 'read_all') _markAllAsRead();
                    if (value == 'clear_all') _cancelAll();
                  },
                ),
                const SizedBox(width: 8),
              ]
            : null,
      ),
      body: pendingNotifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [BoxShadow(color: Colors.grey.withAlpha(51), blurRadius: 20, offset: const Offset(0, 10))],
                    ),
                    child: Icon(Icons.notifications_off_rounded, size: 90, color: Colors.grey[400]),
                  ),
                  const SizedBox(height: 32),
                  const Text('Chưa có thông báo', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: deepBlue)),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      'Chúng tôi sẽ gửi thông báo khi bạn đặt vé thành công hoặc nhắc nhở trước giờ xe chạy',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 15, color: Colors.grey[600], height: 1.5),
                    ),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadPendingNotifications,
              color: primaryGradientStart,
              backgroundColor: Colors.white,
              strokeWidth: 3,
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
                itemCount: pendingNotifications.length,
                itemBuilder: (context, index) {
                  final noti = pendingNotifications[index];
                  final bool isRead = _readStatus[noti.id] ?? false;
                  final bool isBookingSuccess = noti.payload == 'booking_success';

                  DateTime? bookingTime;
                  if (isBookingSuccess && noti.body != null) {
                    final lines = noti.body!.split('\n');
                    if (lines.length > 1 && lines[1].startsWith('Đặt lúc:')) {
                      try {
                        final timeStr = lines[1].replaceFirst('Đặt lúc: ', '').trim();
                        final parts = timeStr.split(' ');
                        if (parts.length == 2) {
                          final dateParts = parts[0].split('/');
                          final timeParts = parts[1].split(':');
                          if (dateParts.length == 2 && timeParts.length == 2) {
                            final now = DateTime.now();
                            bookingTime = DateTime(
                              now.year,
                              int.parse(dateParts[1]),
                              int.parse(dateParts[0]),
                              int.parse(timeParts[0]),
                              int.parse(timeParts[1]),
                            );
                          }
                        }
                      } catch (_) {}
                    }
                  }

                  return Container(
                    margin: const EdgeInsets.only(bottom: 18),
                    child: Card(
                      elevation: isRead ? 5 : 14,
                      shadowColor: isRead ? Colors.grey.withAlpha(40) : primaryGradientStart.withOpacity(0.5),
                      color: isRead 
                          ? cardColor 
                          : (isBookingSuccess ? const Color(0xFFF1FDF6) : const Color(0xFFF8FDFF)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(26),
                        onTap: () {
                          if (!isRead) {
                            setState(() => _readStatus[noti.id] = true);
                          }
                        },
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(22, 22, 18, 22),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Stack(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(15),
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: isBookingSuccess
                                            ? [Colors.green.shade400, Colors.green.shade600]
                                            : [primaryGradientStart, primaryGradientEnd],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      isBookingSuccess ? Icons.check_circle_outline : Icons.directions_bus_filled,
                                      color: Colors.white,
                                      size: 34,
                                    ),
                                  ),
                                  if (!isRead)
                                    Positioned(
                                      right: 4,
                                      top: 4,
                                      child: Container(
                                        width: 18,
                                        height: 18,
                                        decoration: BoxDecoration(
                                          color: Colors.red,
                                          shape: BoxShape.circle,
                                          border: Border.all(color: Colors.white, width: 3.5),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(width: 18),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      noti.title ?? (isBookingSuccess ? 'Đặt vé thành công!' : 'Xe sắp chạy!'),
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18,
                                        color: isBookingSuccess ? Colors.green.shade700 : deepBlue,
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      noti.body ?? 'Thông báo từ hệ thống',
                                      style: TextStyle(
                                        fontSize: 15,
                                        color: isRead ? Colors.black87 : Colors.black,
                                        height: 1.5,
                                        fontWeight: isRead ? FontWeight.w500 : FontWeight.w600,
                                      ),
                                    ),
                                    if (bookingTime != null) ...[
                                      const SizedBox(height: 14),
                                      Row(
                                        children: [
                                          Icon(Icons.access_time, size: 20, color: primaryGradientEnd),
                                          const SizedBox(width: 8),
                                          Text(
                                            'Đặt lúc: ${_formatBookingTime(bookingTime)}',
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                              color: primaryGradientEnd,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: Icon(Icons.close_rounded, color: Colors.redAccent.withOpacity(0.8), size: 26),
                                onPressed: () async {
                                  await FlutterLocalNotificationsPlugin().cancel(noti.id);
                                  setState(() {
                                    pendingNotifications.removeAt(index);
                                    _readStatus.remove(noti.id);
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }

  String _formatBookingTime(DateTime date) {
    final now = DateTime.now();
    if (date.year == now.year && date.month == now.month && date.day == now.day) {
      return 'Hôm nay, ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    }
    return '${date.day}/${date.month} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}