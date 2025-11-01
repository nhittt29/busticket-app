// lib/booking/cubit/booking_cubit.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/booking_api_service.dart';
import 'booking_state.dart'; // ĐỦ: ĐÃ CÓ Seat

class BookingCubit extends Cubit<BookingState> {
  BookingCubit() : super(BookingState.initial());

  void updateFrom(String from) => emit(state.copyWith(from: from));
  void updateTo(String to) => emit(state.copyWith(to: to));
  void selectDate(DateTime date) => emit(state.copyWith(date: date));

  Future<void> searchTrips() async {
    if (state.from.isEmpty || state.to.isEmpty) {
      emit(state.copyWith(error: 'Vui lòng nhập điểm đi và điểm đến'));
      return;
    }
    emit(state.copyWith(loading: true, error: null));
    try {
      final trips = await BookingApiService.searchTrips(state.from, state.to, state.date);
      emit(state.copyWith(trips: trips, loading: false));
    } catch (e) {
      emit(state.copyWith(error: e.toString(), loading: false));
    }
  }

  Future<void> loadSeats(int scheduleId) async {
    emit(state.copyWith(loadingSeats: true, error: null));
    try {
      final seats = await BookingApiService.getSeats(scheduleId);
      emit(state.copyWith(seats: seats, loadingSeats: false));
    } catch (e) {
      emit(state.copyWith(error: e.toString(), loadingSeats: false));
    }
  }

  void selectSeat(Seat seat) { // ĐÚNG: Seat từ booking_state.dart
    if (!seat.isAvailable) return;

    final selected = List<Seat>.from(state.selectedSeats);
    if (selected.contains(seat)) {
      selected.remove(seat);
    } else {
      selected.add(seat);
    }

    final pricePerSeat = state.selectedTrip?.price ?? 0.0;
    final total = selected.length * pricePerSeat;

    emit(state.copyWith(selectedSeats: selected, totalPrice: total));
  }

  void clearSelection() {
    emit(state.copyWith(selectedSeats: [], totalPrice: 0.0));
  }

  void selectTrip(Trip trip) {
    emit(state.copyWith(selectedTrip: trip));
  }

  void clearTrips() {
    emit(state.copyWith(
      trips: [],
      selectedTrip: null,
      seats: [],
      selectedSeats: [],
      totalPrice: 0.0,
      loading: false,
      loadingSeats: false,
    ));
  }
}