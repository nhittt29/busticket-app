// lib/ticket/cubit/ticket_cubit.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/ticket_api_service.dart';
import 'ticket_state.dart';

class TicketCubit extends Cubit<TicketState> {
  TicketCubit() : super(TicketInitial());

  Future<void> loadUserTickets(int userId) async {
    emit(TicketLoading());
    try {
      final tickets = await TicketApiService.getUserTickets(userId);
      emit(TicketLoaded(tickets));
    } catch (e) {
      emit(TicketError(e.toString()));
    }
  }

  Future<void> cancelTicket(int ticketId, int userId) async {
    try {
      await TicketApiService.cancelTicket(ticketId);
      await loadUserTickets(userId);
    } catch (e) {
      emit(TicketError('Hủy vé thất bại: $e'));
    }
  }
}