// lib/services/deep_link_service.dart
import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../main.dart';
import '../../bloc/home/home_bloc.dart';
import '../../bloc/home/home_event.dart';
import '../../ticket/services/ticket_api_service.dart';
import '../../services/reminder_service.dart';
import '../../bloc/auth/auth_bloc.dart';

class DeepLinkService {
  static final DeepLinkService _instance = DeepLinkService._();
  static DeepLinkService get instance => _instance;
  DeepLinkService._();

  final AppLinks _appLinks = AppLinks();
  bool _isProcessing = false; // Tránh xử lý nhiều lần cùng lúc

  void init() {
    // Lắng nghe deep link khi app đang chạy
    _appLinks.uriLinkStream.listen(_handleLink, onError: (err) {
      debugPrint('DeepLink Stream Error: $err');
    });

    // Xử lý deep link khi app được mở từ trạng thái tắt
    _appLinks.getInitialAppLink().then(_handleLink);
  }

  Future<void> _handleLink(Uri? uri) async {
    if (uri == null || _isProcessing) return;
    
    // Check host for custom scheme deep links (busticket://payment-success)
    if (uri.host != 'payment-success' && !uri.path.contains('payment-success')) return;

    _isProcessing = true;

    try {
      final ticketIdParam = uri.queryParameters['ticketId'];
      final paymentIdParam = uri.queryParameters['paymentId'];

      int? paymentHistoryId;

      // Ưu tiên paymentId → chính xác nhất từ MoMo
      if (paymentIdParam != null && paymentIdParam.isNotEmpty) {
        paymentHistoryId = int.tryParse(paymentIdParam);
      }
      // Fallback: dùng ticketId nếu không có paymentId
      else if (ticketIdParam != null && ticketIdParam.isNotEmpty) {
        final ticketId = int.tryParse(ticketIdParam);
        if (ticketId != null) {
          try {
            final ticket = await TicketApiService.getTicketDetail(ticketId);
            paymentHistoryId = ticket['paymentHistoryId'] as int?;
          } catch (e) {
            debugPrint('Lỗi lấy paymentHistoryId từ ticketId: $e');
          }
        }
      }

      if (paymentHistoryId == null) {
        _isProcessing = false;
        return;
      }

      final navigator = MyApp.navigatorKey.currentState;
      if (navigator == null) {
        _isProcessing = false;
        return;
      }

      final context = MyApp.navigatorKey.currentContext;
      if (context == null || !context.mounted) {
        _isProcessing = false;
        return;
      }

      // Đảm bảo đã đăng nhập
      final authState = context.read<AuthBloc>().state;
      final int? currentUserId = authState.userId;

      if (currentUserId == null) {
        debugPrint('DeepLink: Người dùng chưa đăng nhập');
        _isProcessing = false;
        return;
      }

      final homeBloc = context.read<HomeBloc>();

      // Reset trạng thái cũ
      homeBloc.add(ClearTicketIdEvent());
      homeBloc.add(LoadUserEvent());

      // Chuyển về trang chủ trước (tránh lỗi context)
      navigator.pushNamedAndRemoveUntil('/home', (route) => false);

      // Đợi UI ổn định
      await Future.delayed(const Duration(milliseconds: 500));

      if (!context.mounted) {
        _isProcessing = false;
        return;
      }

      // Hiển thị thông báo đặt vé thành công
      try {
        final ticketData = await TicketApiService.getTicketDetailByPaymentHistoryId(paymentHistoryId);

        if (ticketData != null && context.mounted) {
          final seatsList = ticketData['seats'] as List<dynamic>? ?? [];
          final seatNumbers = seatsList.isEmpty
              ? 'Không rõ'
              : seatsList
                  .map((s) {
                    final num = s['seatNumber'] ?? s['number'] ?? s['code'];
                    return num?.toString().padLeft(2, '0');
                  })
                  .where((e) => e != null)
                  .join(', ');

          final departureAt = ticketData['schedule']?['departureAt'] as String?;
          final departureTime = departureAt != null
              ? DateTime.tryParse(departureAt)
                      ?.toLocal()
                      .toString()
                      .substring(0, 16)
                      .replaceAll('T', ' ') ??
                  'Chưa xác định'
              : 'Chưa xác định';

          await ReminderService.showBookingSuccessNotification(
            paymentHistoryId: paymentHistoryId,
            userId: currentUserId,
            busName: (ticketData['schedule']?['bus']?['name'] as String?) ?? 'Xe khách',
            seatNumbers: seatNumbers,
            from: (ticketData['schedule']?['route']?['startPoint'] as String?) ?? 'Không rõ',
            to: (ticketData['schedule']?['route']?['endPoint'] as String?) ?? 'Không rõ',
            departureTime: departureTime,
          );
        }
      } catch (e) {
        debugPrint('Lỗi hiển thị thông báo deep link: $e');
      }

      // Mở màn hình Payment Success
      if (context.mounted) {
        Navigator.pushNamed(context, '/payment-success', arguments: paymentHistoryId);
        homeBloc.add(RefreshNotificationsEvent());
      }
    } catch (e) {
      debugPrint('DeepLink xử lý lỗi nghiêm trọng: $e');
    } finally {
      _isProcessing = false;
    }
  }
}