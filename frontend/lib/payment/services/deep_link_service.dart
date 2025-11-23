// lib/services/deep_link_service.dart
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

  void init() {
    _appLinks.uriLinkStream.listen(_handleLink);
    _appLinks.getInitialAppLink().then(_handleLink);
  }

  Future<void> _handleLink(Uri? uri) async {
    if (uri == null) return;
    if (!uri.path.contains('payment-success')) return;

    final ticketIdParam = uri.queryParameters['ticketId'];
    final paymentIdParam = uri.queryParameters['paymentId'];

    int? paymentHistoryId;
    const String route = '/group-qr';

    // Lấy paymentHistoryId từ paymentId hoặc ticketId
    if (paymentIdParam != null) {
      paymentHistoryId = int.tryParse(paymentIdParam);
    } else if (ticketIdParam != null) {
      final ticketId = int.tryParse(ticketIdParam);
      if (ticketId != null) {
        try {
          final ticket = await TicketApiService.getTicketDetail(ticketId);
          paymentHistoryId = ticket['paymentHistoryId'] as int?;
        } catch (e) {
          debugPrint('Lỗi lấy ticket detail từ deep link: $e');
        }
      }
    }

    if (paymentHistoryId == null) return;

    final navigator = MyApp.navigatorKey.currentState;
    if (navigator == null) return;

    final context = MyApp.navigatorKey.currentContext;
    if (context == null) return;

    // Lấy userId từ AuthBloc – BẮT BUỘC PHẢI CÓ
    final authState = context.read<AuthBloc>().state;
    final int? currentUserId = authState.userId;

    if (currentUserId == null) {
      debugPrint('DeepLink: Không tìm thấy userId → Bỏ qua thông báo');
      return;
    }

    final homeBloc = context.read<HomeBloc>();

    // Reset dữ liệu cũ
    homeBloc.add(ClearTicketIdEvent());
    await Future.delayed(const Duration(milliseconds: 100));
    homeBloc.add(LoadUserEvent());

    // Vào trang chủ trước
    navigator.pushNamedAndRemoveUntil('/home', (route) => false);

    // Đợi UI ổn định rồi mới hiện thông báo + mở QR
    await Future.delayed(const Duration(milliseconds: 600));

    if (!context.mounted) return;

    try {
      final ticket = await TicketApiService.getTicketDetailByPaymentHistoryId(paymentHistoryId);

      if (ticket != null && context.mounted) {
        final seatsList = (ticket['seats'] as List<dynamic>?);
        final seatNumbers = seatsList != null
            ? seatsList
                .map((s) {
                  final seatNum = s['seatNumber'] ?? s['number'];
                  return seatNum != null ? seatNum.toString().padLeft(2, '0') : null;
                })
                .where((e) => e != null)
                .join(', ')
            : 'Không rõ';

        final departureAt = ticket['schedule']?['departureAt'] as String?;
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
          userId: currentUserId, // ĐÃ ĐÚNG KIỂU int
          busName: (ticket['schedule']?['bus']?['name'] as String?) ?? 'Xe khách',
          seatNumbers: seatNumbers,
          from: (ticket['schedule']?['route']?['startPoint'] as String?) ?? 'Không rõ',
          to: (ticket['schedule']?['route']?['endPoint'] as String?) ?? 'Không rõ',
          departureTime: departureTime,
        );
      }
    } catch (e) {
      debugPrint('Lỗi hiển thị thông báo từ deep link: $e');
    }

    // Chỉ push QR khi context vẫn còn mounted
    if (context.mounted) {
      Navigator.pushNamed(context, route, arguments: paymentHistoryId);
      homeBloc.add(RefreshNotificationsEvent());
    }
  }
}