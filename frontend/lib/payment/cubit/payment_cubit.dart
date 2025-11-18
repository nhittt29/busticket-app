import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/payment_api_service.dart';
import 'payment_state.dart';
import '../../bloc/home/home_bloc.dart';
import '../../bloc/home/home_event.dart';
import '../../ticket/services/ticket_api_service.dart';

class PaymentCubit extends Cubit<PaymentState> {
  PaymentCubit() : super(const PaymentInitial(PaymentMethod.MOMO));

  void selectMethod(PaymentMethod method) {
    emit(PaymentInitial(method));
  }

  Future<void> pay({
    required BuildContext context,
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

      // Lấy paymentHistoryId từ bất kỳ vé nào trong nhóm
      final paymentHistoryId = data['tickets'][0]['paymentHistoryId'] as int;
      final ticketId = data['tickets'][0]['id'] as int;
      final momoUrl = data['payment']?['payUrl'] as String?;

      // Lấy thông tin vé đầy đủ để cập nhật Home
      final fullTicket = await TicketApiService.getTicketDetail(ticketId);
      if (context.mounted) {
        context.read<HomeBloc>().add(SetNewTicketEvent(fullTicket));
      }

      if (currentMethod == PaymentMethod.MOMO && momoUrl != null) {
        emit(PaymentSuccess(
          ticketId: ticketId,
          momoPayUrl: momoUrl,
          paymentHistoryId: paymentHistoryId,
        ));
      } else {
        emit(PaymentSuccess(
          ticketId: ticketId,
          paymentHistoryId: paymentHistoryId,
        ));
      }
    } catch (e) {
      emit(PaymentFailure(e.toString()));
    }
  }
}