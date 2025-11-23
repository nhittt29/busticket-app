// lib/payment/screens/payment_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../../booking/cubit/booking_cubit.dart';
import '../cubit/payment_cubit.dart';
import '../cubit/payment_state.dart';
import '../widgets/payment_method_tile.dart';

const Color primaryBlue = Color(0xFF1976D2);
const Color primaryGradientStart = Color(0xFF6AB7F5);
const Color primaryGradientEnd = Color(0xFF4A9EFF);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color greenSuccess = Color(0xFF4CAF50);

class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final selectedSeats = context.read<BookingCubit>().state.selectedSeats;
    final totalPrice = context.read<BookingCubit>().state.totalPrice;
    final scheduleId = context.read<BookingCubit>().state.selectedTrip?.id;
    final userId = context.read<AuthBloc>().state.userId;

    if (userId == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Vui lòng đăng nhập lại'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
        Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
      });
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return BlocProvider(
      create: (_) => PaymentCubit(),
      child: Scaffold(
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
          title: const Text(
            'Thanh toán vé xe',
            style: TextStyle(
              color: Colors.white,
              fontSize: 23,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
        ),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thông tin ghế + tổng tiền
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFA0D8F1).withAlpha(153), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withAlpha(51),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Ghế đã chọn',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: selectedSeats.map((seat) => Chip(
                        label: Text(
                          seat.seatNumber,
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        backgroundColor: primaryGradientStart,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      )).toList(),
                    ),
                    const Divider(height: 32, thickness: 1.2, color: Color(0xFFE0E0E0)),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Tổng tiền',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF023E0E8A)),
                        ),
                        Text(
                          '${totalPrice.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: greenSuccess,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              const Text(
                'Chọn phương thức thanh toán',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
              ),
              const SizedBox(height: 16),

              // Danh sách phương thức thanh toán
              BlocBuilder<PaymentCubit, PaymentState>(
                builder: (context, state) {
                  final method = state is PaymentInitial ? state.method : PaymentMethod.momo;
                  return Column(
                    children: [
                      PaymentMethodTile(
                        icon: Icons.account_balance_wallet,
                        title: 'Ví MoMo',
                        isSelected: method == PaymentMethod.momo,
                        onTap: () => context.read<PaymentCubit>().selectMethod(PaymentMethod.momo),
                      ),
                      const SizedBox(height: 12),
                      PaymentMethodTile(
                        icon: Icons.payments_rounded,
                        title: 'Tiền mặt (Thanh toán tại quầy)',
                        isSelected: method == PaymentMethod.cash,
                        onTap: () => context.read<PaymentCubit>().selectMethod(PaymentMethod.cash),
                      ),
                    ],
                  );
                },
              ),

              const Spacer(),

              // Nút thanh toán
              BlocConsumer<PaymentCubit, PaymentState>(
                listener: (context, state) {
                  if (state is PaymentSuccess) {
                    if (state.momoPayUrl != null) {
                      launchUrl(
                        Uri.parse(state.momoPayUrl!),
                        mode: LaunchMode.externalApplication,
                      );
                    } else {
                      Navigator.pushNamed(
                        context,
                        '/group-qr',
                        arguments: state.paymentHistoryId,
                      );
                    }
                  } else if (state is PaymentFailure) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(state.error),
                        backgroundColor: Colors.redAccent,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        margin: const EdgeInsets.all(16),
                      ),
                    );
                  }
                },
                builder: (context, state) {
                  final isLoading = state is PaymentLoading;
                  return SizedBox(
                    width: double.infinity,
                    height: 64,
                    child: ElevatedButton.icon(
                      onPressed: isLoading || selectedSeats.isEmpty
                          ? null
                          : () {
                              context.read<PaymentCubit>().pay(
                                context: context,
                                userId: userId,
                                scheduleId: scheduleId!,
                                seatIds: selectedSeats.map((s) => s.id).toList(),
                                totalPrice: totalPrice,
                              );
                            },
                      icon: isLoading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                            )
                          : const Icon(Icons.payment, size: 28),
                      label: Text(
                        isLoading ? 'Đang xử lý...' : 'Thanh toán ngay',
                        style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryGradientStart,
                        disabledBackgroundColor: Colors.grey[400],
                        foregroundColor: Colors.white,
                        elevation: 12,
                        shadowColor: primaryGradientStart.withAlpha(128),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}