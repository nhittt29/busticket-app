// lib/payment/cubit/payment_state.dart
import 'package:equatable/equatable.dart';

enum PaymentMethod { momo, cash }

sealed class PaymentState extends Equatable {
  const PaymentState();

  @override
  List<Object?> get props => [];
}

class PaymentInitial extends PaymentState {
  final PaymentMethod method;
  const PaymentInitial(this.method);

  @override
  List<Object?> get props => [method];
}

class PaymentLoading extends PaymentState {
  const PaymentLoading();
}

class PaymentSuccess extends PaymentState {
  final int? ticketId;
  final String? momoPayUrl;
  final int paymentHistoryId;

  const PaymentSuccess({
    this.ticketId,
    this.momoPayUrl,
    required this.paymentHistoryId,
  });

  @override
  List<Object?> get props => [ticketId, momoPayUrl, paymentHistoryId];
}

class PaymentFailure extends PaymentState {
  final String error;
  const PaymentFailure(this.error);

  @override
  List<Object?> get props => [error];
}