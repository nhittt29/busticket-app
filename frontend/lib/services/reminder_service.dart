// lib/services/reminder_service.dart
import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';

class ReminderService {
  static final ReminderService _instance = ReminderService._internal();
  factory ReminderService() => _instance;
  ReminderService._internal();

  static final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  static bool _initialized = false;
  static int? _currentUserId;

  // Lưu userId hiện tại vào bộ nhớ
  static Future<void> _setCurrentUserId(int userId) async {
    _currentUserId = userId;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('reminder_current_user_id', userId);
    if (kDebugMode) {
      debugPrint('REMINDER_SERVICE: ĐÃ LƯU USER ID = $userId');
    }
  }

  static Future<void> _loadCurrentUserId() async {
    final prefs = await SharedPreferences.getInstance();
    _currentUserId = prefs.getInt('reminder_current_user_id');
    if (kDebugMode) {
      debugPrint('REMINDER_SERVICE: TẢI USER ID TỪ LƯU TRỮ = $_currentUserId');
    }
  }

  static Future<void> clearOnLogout() async {
    _currentUserId = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('reminder_current_user_id');
    if (kDebugMode) {
      debugPrint('REMINDER_SERVICE: ĐÃ XÓA USER ID KHI ĐĂNG XUẤT');
    }
  }

  /// KIỂM TRA CHÍNH XÁC 100% THÔNG BÁO CÓ THUỘC VỀ USER HIỆN TẠI KHÔNG
  /// - Đặt vé thành công: notificationId = paymentHistoryId + (userId * 100000) + 900000
  /// - Nhắc nhở khởi hành: notificationId = paymentHistoryId + (userId * 100000)
  static bool _isNotificationForCurrentUser(int notificationId) {
    if (_currentUserId == null) {
      if (kDebugMode) debugPrint('REMINDER_SERVICE: USER CHƯA ĐĂNG NHẬP → KHÔNG HIỆN THÔNG BÁO');
      return false;
    }

    int userPart;

    if (notificationId >= 2000000) {
      // Thông báo hệ thống (Unreviewed...): có +2000000
      userPart = (notificationId - 2000000) ~/ 100000;
    } else if (notificationId >= 900000) {
      // Thông báo đặt vé thành công: có +900000
      userPart = (notificationId - 900000) ~/ 100000;
    } else {
      // Thông báo nhắc nhở khởi hành: không có offset lớn
      userPart = notificationId ~/ 100000;
    }

    final match = userPart == _currentUserId;
    if (kDebugMode) {
      debugPrint('REMINDER_SERVICE: Kiểm tra noti ID $notificationId → userPart: $userPart → currentUser: $_currentUserId → match: $match');
    }
    return match;
  }

  static final StreamController<String?> selectNotificationStream = StreamController<String?>.broadcast();

  Future<void> initialize() async {
    if (_initialized) return;

    tz.initializeTimeZones();
    tz.setLocalLocation(tz.getLocation('Asia/Ho_Chi_Minh'));

    const AndroidInitializationSettings android =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    final InitializationSettings settings = InitializationSettings(
      android: android,
    );

    // Xử lý khi click vào thông báo (Foreground/Background)
    await _notifications.initialize(
      settings,
      onDidReceiveNotificationResponse: (NotificationResponse notificationResponse) {
        if (kDebugMode) {
          debugPrint('CLICK THÔNG BÁO: ${notificationResponse.payload}');
        }
         selectNotificationStream.add(notificationResponse.payload);
      },
    );

    const AndroidNotificationChannel successChannel = AndroidNotificationChannel(
      'booking_success_channel',
      'Đặt vé thành công',
      description: 'Thông báo khi đặt vé thành công',
      importance: Importance.high,
      playSound: true,
      enableVibration: true,
    );

    const AndroidNotificationChannel reminderChannel = AndroidNotificationChannel(
      'reminder_channel',
      'Nhắc nhở khởi hành',
      description: 'Thông báo 1 tiếng trước khi xe chạy',
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
    );
    
    // Channel riêng cho Review (nếu muốn tách biệt)
    const AndroidNotificationChannel reviewChannel = AndroidNotificationChannel(
      'review_channel',
      'Nhắc nhở đánh giá',
      description: 'Nhắc khách hàng đánh giá sau chuyến đi',
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
    );

    final androidPlugin = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    await androidPlugin?.createNotificationChannel(successChannel);
    await androidPlugin?.createNotificationChannel(reminderChannel);
    await androidPlugin?.createNotificationChannel(reviewChannel);

    await _loadCurrentUserId();

    // TỰ ĐỘNG XÓA THÔNG BÁO CŨ (CHỈ CHẠY 1 LẦN DUY NHẤT KHI CÓ QUÁ NHIỀU THÔNG BÁO LỖI)
    final pending = await _notifications.pendingNotificationRequests();
    if (pending.length > 10) {
      for (final request in pending) {
        await _notifications.cancel(request.id);
      }
      if (kDebugMode) {
        debugPrint('REMINDER_SERVICE: ĐÃ TỰ ĐỘNG XÓA ${pending.length} THÔNG BÁO CŨ ĐỂ TRÁNH LỖI HIỂN THỊ!');
      }
    }
    
    // Check launch details (App launched by notification)
    final NotificationAppLaunchDetails? notificationAppLaunchDetails =
        await _notifications.getNotificationAppLaunchDetails();
    if (notificationAppLaunchDetails?.didNotificationLaunchApp ?? false) {
      final payload = notificationAppLaunchDetails!.notificationResponse?.payload;
      if (payload != null) {
        if (kDebugMode) debugPrint('APP LAUNCHED BY NOTIFICATION: $payload');
        // Thêm delay nhỏ để UI kịp lắng nghe
        Future.delayed(const Duration(milliseconds: 500), () {
           selectNotificationStream.add(payload);
        });
      }
    }

    _initialized = true;

    if (kDebugMode) {
      debugPrint('REMINDER_SERVICE: ĐÃ KHỞI TẠO THÀNH CÔNG!');
    }
  }

  // THÔNG BÁO ĐẶT VÉ THÀNH CÔNG – CHỈ HIỆN CHO USER ĐÓ
  static Future<void> showBookingSuccessNotification({
    required int paymentHistoryId,
    required String busName,
    required String seatNumbers,
    required String from,
    required String to,
    required String departureTime,
    required int userId,
  }) async {
    await ReminderService().initialize();
    await _setCurrentUserId(userId);

    // CÔNG THỨC MỚI CHÍNH XÁC 100%: nhúng userId vào hàng trăm nghìn
    final notificationId = paymentHistoryId + (userId * 100000) + 900000;

    if (!_isNotificationForCurrentUser(notificationId)) {
      if (kDebugMode) {
        debugPrint('BỎ QUA THÔNG BÁO ĐẶT VÉ – KHÔNG PHẢI CỦA USER $userId (ID: $notificationId)');
      }
      return;
    }

    try {
      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        'booking_success_channel',
        'Đặt vé thành công',
        channelDescription: 'Thông báo khi đặt vé thành công',
        importance: Importance.high,
        priority: Priority.high,
        color: Color(0xFF4CAF50),
        icon: '@mipmap/ic_launcher',
      );

      const NotificationDetails details = NotificationDetails(android: androidDetails);

      final now = DateTime.now();
      final bodyText = '$busName • Ghế $seatNumbers • $from → $to • $departureTime';

      await _notifications.zonedSchedule(
        notificationId,
        'Đặt vé thành công!',
        bodyText,
        tz.TZDateTime.now(tz.local).add(const Duration(seconds: 1)),
        details,
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: 'booking_success|${now.millisecondsSinceEpoch}',
      );

      if (kDebugMode) {
        debugPrint('ĐÃ GỬI THÔNG BÁO ĐẶT VÉ THÀNH CÔNG CHO USER $userId!');
        debugPrint('   → Notification ID: $notificationId');
        debugPrint('   → Nội dung: $bodyText');
      }
    } catch (e, stack) {
      if (kDebugMode) {
        debugPrint('LỖI KHI GỬI THÔNG BÁO ĐẶT VÉ: $e');
        debugPrint('Stack trace: $stack');
      }
    }
  }

  // NHẮC NHỞ KHỞI HÀNH – CHỈ HIỆN CHO USER ĐÓ
  Future<void> scheduleDepartureReminder({
    required int scheduleId,
    required int paymentHistoryId,
    required int userId,
  }) async {
    await initialize();
    await _setCurrentUserId(userId);

    // CÔNG THỨC MỚI: nhúng userId vào hàng trăm nghìn (không +900000)
    final notificationId = paymentHistoryId + (userId * 100000);

    if (!_isNotificationForCurrentUser(notificationId)) {
      if (kDebugMode) {
        debugPrint('BỎ QUA NHẮC NHỞ KHỞI HÀNH – KHÔNG PHẢI CỦA USER $userId (ID: $notificationId)');
      }
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3000/api/bookings/reminder-info/$scheduleId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        if (kDebugMode) debugPrint('API reminder-info trả lỗi: ${response.statusCode}');
        return;
      }

      final data = jsonDecode(response.body);
      final departureTime = DateTime.parse(data['departureAt']).toLocal();
      final reminderTime = departureTime.subtract(const Duration(hours: 1));

      if (reminderTime.isBefore(DateTime.now())) {
        if (kDebugMode) debugPrint('ĐÃ QUA GIỜ NHẮC (${reminderTime.hour}:${reminderTime.minute}) → BỎ QUA KHÔNG NHẮC NỮA (ID: $notificationId)');
        return;
      }

      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        'reminder_channel',
        'Nhắc nhở khởi hành',
        importance: Importance.max,
        priority: Priority.high,
      );

      const NotificationDetails details = NotificationDetails(android: androidDetails);

      await _notifications.zonedSchedule(
        notificationId,
        'Chuyến đi sắp khởi hành! 🚌',
        'Xe ${data['busName']} sẽ khởi hành trong 1 giờ nữa. Ghế ${data['seatNumbers'].join(', ')} • ${data['from']} → ${data['to']}',
        tz.TZDateTime.from(reminderTime, tz.local),
        details,
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: 'departure_reminder|${reminderTime.millisecondsSinceEpoch}',
      );

      if (kDebugMode) {
        debugPrint('LÊN LỊCH NHẮC NHỞ KHỞI HÀNH THÀNH CÔNG!');
        debugPrint('   → User ID: $userId');
        debugPrint('   → Notification ID: $notificationId');
        debugPrint('   → Nhắc lúc: $reminderTime');
      }
    } catch (e, stack) {
      if (kDebugMode) {
        debugPrint('LỖI KHI LÊN LỊCH NHẮC NHỞ: $e');
        debugPrint('Stack trace: $stack');
      }
    }
  }
  // NHẮC NHỞ THANH TOÁN (10 PHÚT SAU KHI ĐẶT VÉ)
  Future<void> schedulePaymentReminder({
    required int paymentHistoryId,
    required int userId,
    required String busName,
    required String from,
    required String to,
    required DateTime bookTime,
  }) async {
    await initialize();
    await _setCurrentUserId(userId);

    // CÔNG THỨC: paymentHistoryId + (userId * 100000) + 500000
    final notificationId = paymentHistoryId + (userId * 100000) + 500000;

    // Thời gian nhắc: 10 phút sau khi đặt vé
    final reminderTime = bookTime.add(const Duration(minutes: 10));

    if (reminderTime.isBefore(DateTime.now())) {
      if (kDebugMode) debugPrint('ĐÃ QUA GIỜ NHẮC THANH TOÁN -> BỎ QUA');
      return;
    }

    try {
      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        'reminder_channel',
        'Nhắc nhở thanh toán',
        importance: Importance.high,
        priority: Priority.high,
      );

      const NotificationDetails details = NotificationDetails(android: androidDetails);

      await _notifications.zonedSchedule(
        notificationId,
        'Sắp hết hạn thanh toán!',
        'Vé xe $busName sẽ bị hủy sau 5 phút nữa nếu chưa thanh toán.',
        tz.TZDateTime.from(reminderTime, tz.local),
        details,
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: 'payment_reminder|${reminderTime.millisecondsSinceEpoch}',
      );

      if (kDebugMode) {
        debugPrint('LÊN LỊCH NHẮC THANH TOÁN THÀNH CÔNG (ID: $notificationId)');
      }
    } catch (e) {
      if (kDebugMode) debugPrint('LỖI LÊN LỊCH NHẮC THANH TOÁN: $e');
    }
  }

  // HỦY NHẮC NHỞ THANH TOÁN
  Future<void> cancelPaymentReminder({
    required int paymentHistoryId,
    required int userId,
  }) async {
    final notificationId = paymentHistoryId + (userId * 100000) + 500000;
    await _notifications.cancel(notificationId);
    if (kDebugMode) {
      debugPrint('ĐÃ HỦY NHẮC THANH TOÁN (ID: $notificationId)');
    }
  }

  // THÔNG BÁO VÉ HẾT HẠN / ĐÃ HỦY (15 PHÚT SAU KHI ĐẶT)
  Future<void> scheduleTicketExpiredNotification({
    required int paymentHistoryId,
    required int userId,
    required String busName,
    required DateTime bookTime,
  }) async {
    await initialize();
    await _setCurrentUserId(userId);

    // CÔNG THỨC: paymentHistoryId + (userId * 100000) + 800000 (Dùng dải 800k)
    final notificationId = paymentHistoryId + (userId * 100000) + 800000;

    // Thời gian: 15 phút sau khi đặt vé
    final expireTime = bookTime.add(const Duration(minutes: 15));

    if (expireTime.isBefore(DateTime.now())) {
      return;
    }

    try {
      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        'reminder_channel', // Dùng chung channel reminder
        'Thông báo vé hủy',
        importance: Importance.max,
        priority: Priority.high,
      );

      const NotificationDetails details = NotificationDetails(android: androidDetails);

      await _notifications.zonedSchedule(
        notificationId,
        'Vé đã bị hủy',
        'Vé xe $busName đã tự động hủy do quá hạn thanh toán.',
        tz.TZDateTime.from(expireTime, tz.local),
        details,
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        payload: 'ticket_expired|${expireTime.millisecondsSinceEpoch}',
      );

      if (kDebugMode) {
        debugPrint('LÊN LỊCH BÁO VÉ HỦY THÀNH CÔNG (ID: $notificationId)');
      }
    } catch (e) {
      if (kDebugMode) debugPrint('LỖI LÊN LỊCH BÁO VÉ HỦY: $e');
    }
  }

  // HỦY THÔNG BÁO VÉ HẾT HẠN (KHI ĐÃ TRẢ TIỀN XONG)
  Future<void> cancelTicketExpiredNotification({
    required int paymentHistoryId,
    required int userId,
  }) async {
    final notificationId = paymentHistoryId + (userId * 100000) + 800000;
    await _notifications.cancel(notificationId);
    if (kDebugMode) {
      debugPrint('ĐÃ HỦY LỊCH BÁO VÉ HỦY (ID: $notificationId)');
    }
  }

  // ===========================================================================
  // NHẮC NHỞ ĐÁNH GIÁ (SAU KHI HOÀN THÀNH CHUYẾN ĐI)
  // ===========================================================================
  Future<void> scheduleReviewReminders({
    required int scheduleId,
    required int paymentHistoryId,
    required int userId,
  }) async {
    await initialize();
    await _setCurrentUserId(userId);

    try {
      // 1. Lấy thông tin chuyến đi (bao gồm ArrivalAt)
      final response = await http.get(
        Uri.parse('http://10.0.2.2:3000/api/bookings/reminder-info/$scheduleId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) return;

      final data = jsonDecode(response.body);
      final arrivalAt = DateTime.parse(data['arrivalAt']).toLocal();

      // Chỉ nhắc khi chuyến đi ĐÃ HOÀN THÀNH (Arrival Time < Now, hoặc sắp đến).
      // Logic: Lên lịch 3 lần nhắc:
      // - Lần 1: Ngay lúc đến nơi (ArrivalAt).
      // - Lần 2: ArrivalAt + 3 giờ.
      // - Lần 3: ArrivalAt + 6 giờ.

      // Base ID cho Review Reminder: paymentHistoryId + (userId * 100000) + 700000 (Dải 700k)
      // Các lần nhắc sẽ cộng thêm 10000, 20000... (hoặc đơn giản là +1, +2, +3 nhưng cẩn thận trùng)
      // Tốt nhất: Base + 0, Base + 1, Base + 2.

      final baseNotificationId = paymentHistoryId + (userId * 100000) + 700000;
      final times = [
        arrivalAt, // Ngay khi đến
        arrivalAt.add(const Duration(hours: 3)),
        arrivalAt.add(const Duration(hours: 6)),
      ];

      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        'review_channel', 
        'Nhắc nhở đánh giá',
        channelDescription: 'Nhắc khách hàng đánh giá sau chuyến đi',
        importance: Importance.max,
        priority: Priority.high,
      );
      const NotificationDetails details = NotificationDetails(android: androidDetails);

      for (int i = 0; i < times.length; i++) {
        final time = times[i];
        final id = baseNotificationId + i;

        if (time.isBefore(DateTime.now())) {
          // Nếu đã qua thời điểm nhắc nhưng chưa quá lâu (ví dụ trong vòng 1 tiếng), có thể nhắc ngay?
          // Nhưng theo yêu cầu: "nếu khách hàng quên thì 3 tiếng nhắc 1 lần".
          // Nếu ArrivalAt là hôm qua, thì hôm nay không nên nhắc ngay lập tức 3 cái dồn dập.
          // Ta chỉ nhắc các mốc trong tương lai.
          continue;
        }

        await _notifications.zonedSchedule(
          id,
          'Chuyến đi đã hoàn thành! 🏁',
          i == 0 
              ? 'Xe đã đến nơi. Bạn cảm thấy chuyến đi thế nào? Hãy đánh giá ngay nhé!'
              : 'Bạn chưa đánh giá chuyến đi vừa rồi. Hãy dành chút thời gian chia sẻ cảm nhận nhé! ⭐',
          tz.TZDateTime.from(time, tz.local),
          details,
          androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
          uiLocalNotificationDateInterpretation:
              UILocalNotificationDateInterpretation.absoluteTime,
          payload: 'review_reminder|$paymentHistoryId|${time.millisecondsSinceEpoch}',
        );
        
        if (kDebugMode) {
          debugPrint('ĐÃ LÊN LỊCH NHẮC ĐÁNH GIÁ #${i+1} (ID: $id) LÚC $time');
        }
      }

    } catch (e) {
      if (kDebugMode) debugPrint('LỖI LÊN LỊCH NHẮC ĐÁNH GIÁ: $e');
    }
  }

  // HỦY NHẮC NHỞ ĐÁNH GIÁ (KHI ĐÃ ĐÁNH GIÁ XONG)
  Future<void> cancelReviewReminders({
    required int paymentHistoryId,
    required int userId,
  }) async {
    final baseNotificationId = paymentHistoryId + (userId * 100000) + 700000;
    // Hủy cả 3 mốc (0, 1, 2)
    for (int i = 0; i < 3; i++) {
      await _notifications.cancel(baseNotificationId + i);
    }
    if (kDebugMode) {
      debugPrint('ĐÃ HỦY TẤT CẢ NHẮC NHỞ ĐÁNH GIÁ CHO PAYMENT $paymentHistoryId');
    }
  }

  // ===========================================================================
  // THÔNG BÁO SỐ LƯỢNG VÉ CHƯA ĐÁNH GIÁ (KHI MỞ APP)
  // ===========================================================================
  Future<void> checkAndShowUnreviewedNotification() async {
    try {
      await initialize();
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('idToken');
      if (token == null) return;

      final response = await http.get(
        Uri.parse('http://10.0.2.2:3000/api/reviews/unreviewed'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final count = data.length;

        if (count > 0) {
          const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
            'review_channel',
            'Nhắc nhở đánh giá',
            channelDescription: 'Nhắc khách hàng đánh giá sau chuyến đi',
            importance: Importance.defaultImportance,
            priority: Priority.defaultPriority,
          );
          const NotificationDetails details = NotificationDetails(android: androidDetails);

          // ID MỚI: 2000000 + (userId * 100000) để đảm bảo đúng user filter
          final userId = _currentUserId ?? 0; // Fallback 0 nhưng logic gọi hàm này sau khi login
          final notificationId = 2000000 + (userId * 100000);

          await _notifications.zonedSchedule(
            notificationId,
            'Chuyến đi chưa đánh giá 📝',
            'Bạn có $count chuyến đi đã hoàn thành nhưng chưa đánh giá. Nhấn để xem ngay!',
            tz.TZDateTime.now(tz.local).add(const Duration(seconds: 1)),
            details,
            androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
            uiLocalNotificationDateInterpretation:
                UILocalNotificationDateInterpretation.absoluteTime,
            payload: 'open_my_reviews|${DateTime.now().millisecondsSinceEpoch}',
          );
        }
      }
    } catch (e) {
      if (kDebugMode) debugPrint('Lỗi kiểm tra vé chưa đánh giá: $e');
    }
  }
}

