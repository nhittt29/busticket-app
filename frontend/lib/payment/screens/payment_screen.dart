import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../../booking/cubit/booking_cubit.dart';
import '../cubit/payment_cubit.dart';
import '../cubit/payment_state.dart';
import '../widgets/payment_method_tile.dart';

const Color greenSoft = Color(0xFF66BB6A);
const Color iconBlue = Color(0xFF1976D2);
const Color backgroundLight = Color(0xFFEAF6FF);

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
          const SnackBar(content: Text('Vui lòng đăng nhập lại'), backgroundColor: Colors.red),
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
          backgroundColor: backgroundLight,
          elevation: 0,
          title: const Text(
            'Thanh toán',
            style: TextStyle(color: Color(0xFF023E8A), fontWeight: FontWeight.bold),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: iconBlue),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Ghế đã chọn', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: selectedSeats.map((seat) => Chip(
                        label: Text(seat.seatNumber, style: const TextStyle(fontSize: 14)),
                        backgroundColor: greenSoft.withOpacity(0.2),
                      )).toList(),
                    ),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Tổng tiền', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        Text(
                          '${totalPrice.toStringAsFixed(0)}đ',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: greenSoft),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text('Chọn phương thức thanh toán', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              BlocBuilder<PaymentCubit, PaymentState>(
                builder: (context, state) {
                  final method = state is PaymentInitial ? state.method : PaymentMethod.MOMO;
                  return Column(
                    children: [
                      PaymentMethodTile(
                        icon: Icons.account_balance_wallet,
                        title: 'Ví MoMo',
                        isSelected: method == PaymentMethod.MOMO,
                        onTap: () => context.read<PaymentCubit>().selectMethod(PaymentMethod.MOMO),
                      ),
                      PaymentMethodTile(
                        icon: Icons.money,
                        title: 'Tiền mặt (Thanh toán tại quầy)',
                        isSelected: method == PaymentMethod.CASH,
                        onTap: () => context.read<PaymentCubit>().selectMethod(PaymentMethod.CASH),
                      ),
                    ],
                  );
                },
              ),
              const Spacer(),
              BlocConsumer<PaymentCubit, PaymentState>(
                listener: (context, state) {
                  if (state is PaymentSuccess) {
                    if (state.momoPayUrl != null) {
                      launchUrl(
                        Uri.parse(state.momoPayUrl!),
                        mode: LaunchMode.externalApplication,
                      );
                    } else {
                      // CASH hoặc MoMo đã thành công → mở QR nhóm bằng paymentHistoryId
                      Navigator.pushNamed(
                        context,
                        '/group-qr',
                        arguments: state.paymentHistoryId,
                      );
                    }
                  } else if (state is PaymentFailure) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(state.error), backgroundColor: Colors.red),
                    );
                  }
                },
                builder: (context, state) {
                  final isLoading = state is PaymentLoading;
                  return SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: greenSoft,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
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
                      child: isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Thanh toán', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
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