import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class LoginEvent extends AuthEvent {
  final String email;
  final String password;

  const LoginEvent(this.email, this.password);

  @override
  List<Object?> get props => [email, password];
}

class RegisterEvent extends AuthEvent {
  final String email;
  final String password;
  final String name;
  final String phone;
  final String? avatarPath;
  final DateTime? dob; // Thêm trường dob
  final String? gender; // Thêm trường gender

  const RegisterEvent(
    this.email,
    this.password,
    this.name,
    this.phone, {
    this.avatarPath,
    this.dob,
    this.gender,
  });

  @override
  List<Object?> get props => [email, password, name, phone, avatarPath, dob, gender];
}

class ForgotPasswordEvent extends AuthEvent {
  final String email;

  const ForgotPasswordEvent(this.email);

  @override
  List<Object?> get props => [email];
}

class ResetPasswordEvent extends AuthEvent {
  final String email;
  final String newPassword;

  const ResetPasswordEvent(this.email, this.newPassword);

  @override
  List<Object?> get props => [email, newPassword];
}

class LoadUserEvent extends AuthEvent {}

class LogoutEvent extends AuthEvent {}

class UpdateUserEvent extends AuthEvent {
  final String name;
  final String? phone;
  final DateTime? dob;
  final String? gender;

  const UpdateUserEvent({
    required this.name,
    this.phone,
    this.dob,
    this.gender,
  });

  @override
  List<Object?> get props => [name, phone, dob, gender];
}