// lib/payment/cubit/payment_state.dart
import 'package:equatable/equatable.dart';

enum PaymentMethod { MOMO, CASH }

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

  @override
  List<Object?> get props => [];
}

class PaymentSuccess extends PaymentState {
  final int ticketId;
  final String? momoPayUrl;
  final String? qrCodeUrl;

  const PaymentSuccess({
    required this.ticketId,
    this.momoPayUrl,
    this.qrCodeUrl,
  });

  @override
  List<Object?> get props => [ticketId, momoPayUrl, qrCodeUrl];
}

class PaymentFailure extends PaymentState {
  final String error;

  const PaymentFailure(this.error);

  @override
  List<Object?> get props => [error];
}