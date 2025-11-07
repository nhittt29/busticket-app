// lib/payment/screens/payment_success_screen.dart
import 'package:flutter/material.dart';

class PaymentSuccessScreen extends StatelessWidget {
  const PaymentSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ticketId = ModalRoute.of(context)!.settings.arguments as int?;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (ticketId != null) {
        Future.delayed(const Duration(milliseconds: 800), () {
          Navigator.pushReplacementNamed(
            context,
            '/ticket-qr',
            arguments: ticketId,
          );
        });
      }
    });

    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle_outline,
              size: 120,
              color: Color(0xFF66BB6A),
            ),
            const SizedBox(height: 32),
            const Text(
              'Thanh toán thành công!',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF023E8A),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              ticketId != null
                  ? 'Đang chuyển đến mã QR vé #${ticketId}...'
                  : 'Đang xử lý...',
              style: const TextStyle(fontSize: 16, color: Colors.black54),
            ),
            const SizedBox(height: 40),
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF66BB6A)),
            ),
          ],
        ),
      ),
    );
  }
}