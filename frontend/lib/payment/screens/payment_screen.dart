// lib/payment/screens/payment_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../../bloc/notification/notification_bloc.dart';
import '../../bloc/notification/notification_event.dart';
import '../../booking/cubit/booking_cubit.dart';
import '../cubit/payment_cubit.dart';
import '../cubit/payment_state.dart';
import '../widgets/payment_method_tile.dart';
import 'momo_webview_screen.dart';

import '../../booking/cubit/booking_state.dart' as bs;
import '../../promotions/models/promotion.dart';


const Color primaryBlue = Color(0xFF6AB7F5);
const Color accentBlue = Color(0xFF4A9EFF);
const Color deepBlue = Color(0xFF1976D2);
const Color pastelBlue = Color(0xFFA0D8F1);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color successGreen = Color(0xFF4CAF50);

class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authState = context.read<AuthBloc>().state;

    final userMap = authState.user;
    final userId = userMap?['id'] as int?;
    final userName = userMap?['name'] as String? ?? 'Chưa cập nhật';
    final userPhone = userMap?['phone'] as String? ?? 'Chưa cập nhật số điện thoại';

    if (userId == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Vui lòng đăng nhập lại'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
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
                colors: [primaryBlue, accentBlue],
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
        body: BlocBuilder<BookingCubit, bs.BookingState>(
          builder: (context, bookingState) {
            final selectedSeats = bookingState.selectedSeats;
            final double amountToPay = bookingState.finalTotalPrice;

            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: pastelBlue.withAlpha(178), width: 1.8),
                      boxShadow: [
                        BoxShadow(color: Colors.grey.withAlpha(70), blurRadius: 16, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: pastelBlue.withAlpha(77),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Icon(Icons.person_outline_rounded, color: deepBlue, size: 28),
                            ),
                            const SizedBox(width: 14),
                            const Text(
                              'Thông tin người đặt vé',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),
                        _buildInfoRow(Icons.account_circle_outlined, 'Họ và tên', userName),
                        const SizedBox(height: 14),
                        _buildInfoRow(Icons.phone_android_outlined, 'Số điện thoại', userPhone),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // --- SEATS SECTION ---
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: pastelBlue.withAlpha(153), width: 1.5),
                      boxShadow: [
                        BoxShadow(color: Colors.grey.withAlpha(70), blurRadius: 16, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Ghế đã chọn', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF023E8A))),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: selectedSeats.map((seat) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [primaryBlue, accentBlue]),
                              borderRadius: BorderRadius.circular(30),
                              boxShadow: [BoxShadow(color: primaryBlue.withAlpha(102), blurRadius: 6, offset: const Offset(0, 3))],
                            ),
                            child: Text(seat.seatNumber, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                          )).toList(),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // --- PROMOTION SECTION ---
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: pastelBlue.withAlpha(153), width: 1.5),
                      boxShadow: [
                        BoxShadow(color: Colors.grey.withAlpha(70), blurRadius: 16, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Mã khuyến mãi', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF023E8A))),
                            TextButton(
                              onPressed: () async {
                                final result = await Navigator.pushNamed(context, '/promotions');
                                if (result != null && result is Promotion && context.mounted) {
                                  // Calculate discount
                                  final totalBeforeDiscount = (selectedSeats.length * (bookingState.selectedTrip?.price ?? 0)) + 
                                                            (bookingState.surcharge * selectedSeats.length);
                                  
                                  double discount = 0;
                                  if (result.discountType == 'PERCENTAGE') {
                                    discount = totalBeforeDiscount * (result.discountValue / 100);
                                    if (result.maxDiscount != null && discount > result.maxDiscount!) {
                                      discount = result.maxDiscount!;
                                    }
                                  } else {
                                    discount = result.discountValue;
                                  }

                                  // Ensure discount doesn't exceed total
                                  if (discount > totalBeforeDiscount) {
                                    discount = totalBeforeDiscount;
                                  }

                                  context.read<BookingCubit>().applyPromotion(result, discount);
                                  
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Áp dụng mã khuyến mãi thành công!'),
                                      backgroundColor: successGreen,
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                }
                              },
                              child: const Text('Chọn mã', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: primaryBlue)),
                            ),
                          ],
                        ),
                        if (bookingState.selectedPromotion != null) ...[
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: successGreen.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: successGreen.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.local_offer_rounded, color: successGreen),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        bookingState.selectedPromotion!.code,
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: successGreen),
                                      ),
                                      Text(
                                        bookingState.selectedPromotion!.description,
                                        style: const TextStyle(fontSize: 12, color: Colors.black54),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.close, size: 20, color: Colors.grey),
                                  onPressed: () {
                                    context.read<BookingCubit>().removePromotion();
                                  },
                                )
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  // --- END PROMOTION SECTION ---

                  const SizedBox(height: 20),

                  // --- PAYMENT DETAILS SECTION ---
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: pastelBlue.withAlpha(153), width: 1.5),
                      boxShadow: [
                        BoxShadow(color: Colors.grey.withAlpha(70), blurRadius: 16, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Chi tiết thanh toán', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF023E8A))),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Giá vé (${selectedSeats.length} ghế)', style: const TextStyle(fontSize: 16, color: Colors.black87)),
                            Text(
                              '${bookingState.totalPrice.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        if (bookingState.surcharge > 0) ...[
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Phụ thu', style: TextStyle(fontSize: 16, color: Colors.black87)),
                              Text(
                                '+${(bookingState.surcharge * selectedSeats.length).toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.orange),
                              ),
                            ],
                          ),
                        ],
                        if (bookingState.discountAmount > 0) ...[
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Khuyến mãi', style: TextStyle(fontSize: 16, color: successGreen, fontWeight: FontWeight.bold)),
                              Text(
                                '-${bookingState.discountAmount.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: successGreen),
                              ),
                            ],
                          ),
                        ],
                        const Divider(height: 32),
                        Row(
                          children: [
                            const Expanded(
                              child: Text(
                                'Tổng thanh toán',
                                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
                              ),
                            ),
                            Text(
                              '${amountToPay.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: successGreen),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),
                  const Text('Chọn phương thức thanh toán', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF023E8A))),
                  const SizedBox(height: 14),

                  BlocBuilder<PaymentCubit, PaymentState>(
                    builder: (context, state) {
                      final method = state is PaymentInitial ? state.method : PaymentMethod.momo;
                      return Column(
                        children: [
                          PaymentMethodTile(
                            icon: Icons.account_balance_wallet_rounded,
                            title: 'Ví MoMo',
                            isSelected: method == PaymentMethod.momo,
                            onTap: () => context.read<PaymentCubit>().selectMethod(PaymentMethod.momo),
                          ),
                          const SizedBox(height: 14),
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

                  const SizedBox(height: 100),
                ],
              ),
            );
          },
        ),

        bottomNavigationBar: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [BoxShadow(color: Colors.black.withAlpha(30), blurRadius: 20, offset: const Offset(0, -5))],
          ),
          child: SafeArea(
            child: BlocConsumer<PaymentCubit, PaymentState>(
              listener: (context, state) {
                if (state is PaymentSuccess) {
                  context.read<NotificationBloc>().add(LoadNotificationsEvent());
                  
                  if (state.momoPayUrl != null && state.momoPayUrl!.isNotEmpty) {
                    // Sử dụng WebView tích hợp để chặn redirect
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => MomoWebViewScreen(paymentUrl: state.momoPayUrl!),
                      ),
                    ).then((result) {
                      // Nếu trả về true (thanh toán thành công & redirect đúng)
                      if (result == true) {
                         Navigator.pushReplacementNamed(context, '/payment-success', arguments: state.paymentHistoryId);
                      }
                    });
                  } else {
                    Navigator.pushNamed(context, '/group-qr', arguments: state.paymentHistoryId);
                  }
                } else if (state is PaymentFailure) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(state.error),
                      backgroundColor: Colors.redAccent,
                      behavior: SnackBarBehavior.floating,
                      margin: const EdgeInsets.all(16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  );
                }
              },
              builder: (context, state) {
                final isLoading = state is PaymentLoading;
                // We need amountToPay here, but it's inside the BlocBuilder above.
                // We should read it from the cubit directly or restructure.
                // Reading from cubit directly is fine for the button action, but for display (if needed) we'd need builder.
                // Here we just need it for the onPressed action.
                final currentBookingState = context.read<BookingCubit>().state;
                final amountToPay = currentBookingState.finalTotalPrice;
                final selectedSeats = currentBookingState.selectedSeats;
                final scheduleId = currentBookingState.selectedTrip?.id;

                return SizedBox(
                  height: 64,
                  child: ElevatedButton.icon(
                    onPressed: isLoading || selectedSeats.isEmpty || scheduleId == null
                        ? null
                        : () {
                            context.read<PaymentCubit>().pay(
                              context: context,
                              userId: userId,
                              scheduleId: scheduleId,
                              seatIds: selectedSeats.map((s) => s.id).toList(),
                              totalPrice: amountToPay,
                            );
                          },
                    icon: isLoading
                        ? const SizedBox(
                            width: 26,
                            height: 26,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                          )
                        : const Icon(Icons.payment_rounded, size: 30),
                    label: Text(
                      isLoading ? 'Đang xử lý...' : 'Thanh toán ngay',
                      style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryBlue,
                      disabledBackgroundColor: Colors.grey[400],
                      foregroundColor: Colors.white,
                      elevation: 10,
                      shadowColor: primaryBlue.withAlpha(130),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: pastelBlue.withAlpha(51), borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, size: 24, color: deepBlue),
        ),
        const SizedBox(width: 14),
        Expanded(
          flex: 2,
          child: Text(
            label,
            style: const TextStyle(fontSize: 15.5, color: Colors.black87, fontWeight: FontWeight.w600),
          ),
        ),
        Expanded(
          flex: 3,
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(fontSize: 16.5, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
          ),
        ),
      ],
    );
  }
}
