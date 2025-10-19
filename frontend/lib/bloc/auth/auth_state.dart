import 'package:equatable/equatable.dart';

class AuthState extends Equatable {
  final bool isLoading;
  final bool success;
  final String? message;
  final String? error;
  final Map<String, dynamic>? user;

  const AuthState({
    this.isLoading = false,
    this.success = false,
    this.message,
    this.error,
    this.user,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? success,
    String? message,
    String? error,
    Map<String, dynamic>? user,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      success: success ?? this.success,
      message: message,
      error: error,
      user: user ?? this.user,
    );
  }

  @override
  List<Object?> get props => [isLoading, success, message, error, user];
}
