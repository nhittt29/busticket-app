// lib/payment/cubit/payment_state.dart
import 'package:equatable/equatable.dart';

enum PaymentMethod { momo, cash, zalopay }

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

  final String? zpTransToken;
  final PaymentMethod method;

  const PaymentSuccess({
    this.ticketId,
    this.momoPayUrl,
    this.zpTransToken,
    required this.paymentHistoryId,
    required this.method,
  });

  @override
  List<Object?> get props => [ticketId, momoPayUrl, zpTransToken, paymentHistoryId, method];
}

class PaymentFailure extends PaymentState {
  final String error;
  const PaymentFailure(this.error);

  @override
  List<Object?> get props => [error];
}