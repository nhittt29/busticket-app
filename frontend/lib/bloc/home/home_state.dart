// lib/bloc/home/home_state.dart
import 'package:equatable/equatable.dart';

class HomeState extends Equatable {
  final bool loading;
  final Map<String, dynamic>? user;
  final String? error;
  final int? ticketId;
  final Map<String, dynamic>? newTicketData;
  final Map<String, dynamic>? upcomingTrip;
  final List<Map<String, dynamic>>? promotions;

  const HomeState({
    this.loading = false,
    this.user,
    this.error,
    this.ticketId,
    this.newTicketData,
    this.upcomingTrip,
    this.promotions,
  });

  HomeState copyWith({
    bool? loading,
    Map<String, dynamic>? user,
    String? error,
    int? ticketId,
    Map<String, dynamic>? newTicketData,
    Map<String, dynamic>? upcomingTrip,
    List<Map<String, dynamic>>? promotions,
  }) {
    return HomeState(
      loading: loading ?? this.loading,
      user: user ?? this.user,
      error: error ?? this.error,
      ticketId: ticketId ?? this.ticketId,
      newTicketData: newTicketData ?? this.newTicketData,
      upcomingTrip: upcomingTrip ?? this.upcomingTrip,
      promotions: promotions ?? this.promotions,
    );
  }

  @override
  List<Object?> get props => [loading, user, error, ticketId, newTicketData, upcomingTrip, promotions];
}