import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/payment_api_service.dart';
import 'payment_state.dart';
import '../../bloc/home/home_bloc.dart';
import '../../bloc/home/home_event.dart';
import '../../ticket/services/ticket_api_service.dart';
import '../../services/reminder_service.dart';
import '../../booking/cubit/booking_cubit.dart';

class PaymentCubit extends Cubit<PaymentState> {
  PaymentCubit() : super(const PaymentInitial(PaymentMethod.momo));

  void selectMethod(PaymentMethod method) {
    emit(PaymentInitial(method));
  }

  String _safeString(dynamic value, [String fallback = 'Không rõ']) {
    if (value == null) return fallback;
    final str = value.toString().trim();
    return str.isEmpty ? fallback : str;
  }

  String _formatSeatDisplay(dynamic seatData) {
    if (seatData == null) return 'Không rõ';
    List<String> seats = [];

    if (seatData is List) {
      for (var s in seatData) {
        if (s is Map<String, dynamic>) {
          final code = s['code']?.toString();
          final seatNumber = s['seatNumber'] ?? s['number'];
          if (code != null && code.isNotEmpty) {
            seats.add(code);
          } else if (seatNumber != null) {
            seats.add(seatNumber.toString().padLeft(2, '0'));
          }
        } else if (s is int) {
          seats.add(s.toString().padLeft(2, '0'));
        }
      }
    } else if (seatData is Map<String, dynamic>) {
      final code = seatData['code']?.toString();
      final seatNumber = seatData['seatNumber'] ?? seatData['number'];
      if (code != null && code.isNotEmpty) {
        seats.add(code);
      } else if (seatNumber != null) {
        seats.add(seatNumber.toString().padLeft(2, '0'));
      }
    }

    return seats.isEmpty ? 'Không rõ' : seats.join(', ');
  }

  String _formatTime(String? isoString) {
    if (isoString == null || isoString.isEmpty) return 'Chưa xác định';
    final date = DateTime.tryParse(isoString);
    if (date == null) return 'Chưa xác định';
    return '${date.day}/${date.month} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
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
          : PaymentMethod.momo;

      if (userId <= 0) {
        emit(const PaymentFailure('ID người dùng không hợp lệ'));
        return;
      }

      final bookingState = context.read<BookingCubit>().state;

      final data = await PaymentApiService.createBulkTickets(
        context: context,
        userId: userId,
        scheduleId: scheduleId,
        seatIds: seatIds,
        totalPrice: bookingState.finalTotalPrice,
        paymentMethod: currentMethod.name.toUpperCase(),
        promotionId: bookingState.selectedPromotion?.id,
        discountAmount: bookingState.discountAmount,
      );

      final paymentHistoryId = data['tickets'][0]['paymentHistoryId'] as int;
      final momoUrl = data['payment']?['payUrl'] as String?;

      List<String> allSeats = [];
      for (var ticket in data['tickets']) {
        final ticketId = ticket['id'] as int;
        final fullTicket = await TicketApiService.getTicketDetail(ticketId);

        if (context.mounted) {
          context.read<HomeBloc>().add(SetNewTicketEvent(fullTicket));
        }

        final seatDisplay = _formatSeatDisplay(fullTicket['seats'] ?? fullTicket['seat']);
        if (seatDisplay != 'Không rõ' && !allSeats.contains(seatDisplay)) {
          allSeats.add(seatDisplay);
        }
      }

      final firstTicket = await TicketApiService.getTicketDetail(data['tickets'][0]['id'] as int);

      // ĐÃ XÓA LOGIC THÔNG BÁO Ở ĐÂY - CHUYỂN SANG PaymentSuccessScreen

      if (currentMethod == PaymentMethod.momo && momoUrl != null && momoUrl.isNotEmpty) {
        emit(PaymentSuccess(
          ticketId: data['tickets'][0]['id'] as int,
          momoPayUrl: momoUrl,
          paymentHistoryId: paymentHistoryId,
        ));
      } else {
        emit(PaymentSuccess(
          ticketId: data['tickets'][0]['id'] as int,
          paymentHistoryId: paymentHistoryId,
        ));
      }
    } catch (e, stackTrace) {
      if (kDebugMode) {
        debugPrint('PaymentCubit Error: $e');
        debugPrint(stackTrace.toString());
      }
      emit(const PaymentFailure('Bạn đã đạt giới hạn đặt vé tối đa 8 vé/ngày.'));
    }
  }
}