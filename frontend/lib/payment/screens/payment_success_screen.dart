import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../services/reminder_service.dart';
import '../../ticket/services/ticket_api_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth_bloc.dart';

class PaymentSuccessScreen extends StatefulWidget {
  final int paymentHistoryId;

  const PaymentSuccessScreen({super.key, required this.paymentHistoryId});

  @override
  State<PaymentSuccessScreen> createState() => _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends State<PaymentSuccessScreen> {
  @override
  void initState() {
    super.initState();
    _triggerSuccessNotification();
  }

  Future<void> _triggerSuccessNotification() async {
    try {
      final authState = context.read<AuthBloc>().state;
      final userId = authState.user?['id'] as int?;

      if (userId == null) return;

      // 1. Lấy chi tiết vé mới nhất từ server
      final ticketData = await TicketApiService.getTicketDetailByPaymentHistoryId(widget.paymentHistoryId);
      
      if (ticketData == null) return;

      // 2. Format dữ liệu
      final tickets = ticketData['tickets'] as List?;
      if (tickets == null || tickets.isEmpty) return;

      final firstTicket = tickets[0];
      final schedule = firstTicket['schedule'];
      if (schedule == null) return;

      final busName = schedule['bus']?['name'] ?? 'Xe khách';
      final startPoint = schedule['route']?['startPoint'] ?? 'Điểm đi';
      final endPoint = schedule['route']?['endPoint'] ?? 'Điểm đến';
      final departureTime = schedule['departureAt']; // ISO String

      final seatList = tickets.map((t) => t['seat']?['seatNumber'] ?? 0).join(', ');

      // 3. Gửi thông báo "Đặt vé thành công"
      await ReminderService.showBookingSuccessNotification(
        paymentHistoryId: widget.paymentHistoryId,
        userId: userId,
        busName: busName,
        seatNumbers: seatList,
        from: startPoint,
        to: endPoint,
        departureTime: _formatTime(departureTime),
      );

      // 4. HỦY NHẮC NHỞ THANH TOÁN (VÌ ĐÃ THANH TOÁN XONG)
      await ReminderService().cancelPaymentReminder(
        paymentHistoryId: widget.paymentHistoryId,
        userId: userId,
      );

      // 5. HỦY THÔNG BÁO VÉ HẾT HẠN (VÌ ĐÃ THANH TOÁN XONG)
      await ReminderService().cancelTicketExpiredNotification(
        paymentHistoryId: widget.paymentHistoryId,
        userId: userId,
      );

      // 4. Lên lịch nhắc nhở trước giờ đi
      await ReminderService().scheduleDepartureReminder(
        scheduleId: schedule['id'],
        paymentHistoryId: widget.paymentHistoryId,
        userId: userId,
      );

    } catch (e) {
      debugPrint('Lỗi gửi thông báo thành công: $e');
    }
  }

  String _formatTime(String? isoString) {
    if (isoString == null || isoString.isEmpty) return 'Chưa xác định';
    final date = DateTime.tryParse(isoString);
    if (date == null) return 'Chưa xác định';
    return '${date.day}/${date.month} ${date.hour.toString().padLeft(2, "0")}:${date.minute.toString().padLeft(2, "0")}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(),
              // Success Icon Animation
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: Colors.green,
                  size: 100,
                ),
              ),
              const SizedBox(height: 32),
              
              const Text(
                'Thanh toán thành công!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF023E8A),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              
              const Text(
                'Vé của bạn đã được đặt thành công.\nBạn có thể xem mã QR để lên xe ngay bây giờ.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              
              const Spacer(),
              
              // View Ticket Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushReplacementNamed(
                      context, 
                      '/group-qr', 
                      arguments: {
                        'id': widget.paymentHistoryId,
                        'showHomeButton': true,
                      }
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF023E8A),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 2,
                  ),
                  child: const Text(
                    'Xem vé của tôi',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              
              // Back to Home Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: TextButton(
                  onPressed: () {
                    Navigator.pushNamedAndRemoveUntil(
                      context, 
                      '/home', 
                      (route) => false
                    );
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.grey[700],
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    'Về trang chủ',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
