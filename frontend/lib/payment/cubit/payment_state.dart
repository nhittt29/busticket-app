// lib/payment/cubit/payment_state.dart
import 'package:equatable/equatable.dart';

enum PaymentMethod { momo, cash, zalopay, vnpay }

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
  final PaymentMethod method;
  const PaymentLoading(this.method);

  @override
  List<Object?> get props => [method];
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
  final PaymentMethod method;
  const PaymentFailure(this.error, this.method);

  @override
  List<Object?> get props => [error, method];
}