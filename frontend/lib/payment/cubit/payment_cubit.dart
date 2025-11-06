// lib/payment/cubit/payment_cubit.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/payment_api_service.dart';
import 'payment_state.dart';

class PaymentCubit extends Cubit<PaymentState> {
  PaymentCubit() : super(const PaymentInitial(PaymentMethod.MOMO));

  void selectMethod(PaymentMethod method) {
    emit(PaymentInitial(method));
  }

  /// SỬA: Thêm userId từ PaymentScreen
  Future<void> pay({
    required int userId,
    required int scheduleId,
    required List<int> seatIds,
    required double totalPrice,
  }) async {
    emit(const PaymentLoading());

    try {
      final currentMethod = state is PaymentInitial
          ? (state as PaymentInitial).method
          : PaymentMethod.MOMO;

      if (userId <= 0) {
        emit(const PaymentFailure('ID người dùng không hợp lệ'));
        return;
      }

      final data = await PaymentApiService.createBulkTickets(
        userId: userId,
        scheduleId: scheduleId,
        seatIds: seatIds,
        totalPrice: totalPrice,
        paymentMethod: currentMethod.name.toUpperCase(),
      );

      final ticketId = data['tickets'][0]['id'];
      final momoUrl = data['payment']?['payUrl'];

      if (currentMethod == PaymentMethod.MOMO && momoUrl != null) {
        emit(PaymentSuccess(
          ticketId: ticketId,
          momoPayUrl: momoUrl,
        ));
      } else {
        final qrCodeUrl = await PaymentApiService.generateQRCode(ticketId);
        emit(PaymentSuccess(
          ticketId: ticketId,
          qrCodeUrl: qrCodeUrl,
        ));
      }
    } catch (e) {
      emit(PaymentFailure(e.toString()));
    }
  }
}