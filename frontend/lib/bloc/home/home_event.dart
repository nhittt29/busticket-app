// lib/bloc/home/home_event.dart
import 'package:equatable/equatable.dart';

abstract class HomeEvent extends Equatable {
  const HomeEvent();

  @override
  List<Object?> get props => [];
}

class LoadUserEvent extends HomeEvent {}
class LogoutEvent extends HomeEvent {}
class ClearTicketIdEvent extends HomeEvent {}
class SetTicketIdEvent extends HomeEvent {
  final int ticketId;
  const SetTicketIdEvent(this.ticketId);

  @override
  List<Object?> get props => [ticketId];
}

class SetNewTicketEvent extends HomeEvent {
  final Map<String, dynamic> ticketData;
  const SetNewTicketEvent(this.ticketData);

  @override
  List<Object?> get props => [ticketData];
}

class RefreshNotificationsEvent extends HomeEvent {
  const RefreshNotificationsEvent();
}

class LoadHomeDataEvent extends HomeEvent {}