// lib/bloc/auth/auth_state.dart
import 'package:equatable/equatable.dart';

class AuthState extends Equatable {
  final bool isLoading;
  final bool success;
  final String? message;
  final String? error;
  final Map<String, dynamic>? user;
  final int? userId;

  const AuthState({
    this.isLoading = false,
    this.success = false,
    this.message,
    this.error,
    this.user,
    this.userId,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? success,
    String? message,
    String? error,
    Map<String, dynamic>? user,
    int? userId,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      success: success ?? this.success,
      message: message,
      error: error,
      user: user ?? this.user,
      userId: userId ?? this.userId,
    );
  }

  @override
  List<Object?> get props => [isLoading, success, message, error, user, userId];
}