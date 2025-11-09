// lib/ticket/cubit/ticket_state.dart
abstract class TicketState {}

class TicketInitial extends TicketState {}
class TicketLoading extends TicketState {}
class TicketLoaded extends TicketState {
  final List<dynamic> tickets;
  TicketLoaded(this.tickets);
}
class TicketError extends TicketState {
  final String message;
  TicketError(this.message);
}