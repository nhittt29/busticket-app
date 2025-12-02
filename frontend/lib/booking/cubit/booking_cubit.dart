// lib/booking/cubit/booking_cubit.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/booking_api_service.dart';
import 'booking_state.dart';
import '../models/dropoff_point.dart';
import '../../promotions/models/promotion.dart';

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
      final trips = await BookingApiService.searchTrips(
        state.from,
        state.to,
        state.date,
      );
      final filteredTrips = trips.where((t) {
        return t.status != 'FULL' &&
               t.status != 'ONGOING' &&
               t.status != 'COMPLETED';
      }).toList();
      emit(state.copyWith(trips: filteredTrips, loading: false));
    } catch (e) {
      emit(state.copyWith(error: e.toString(), loading: false));
    }
  }

  // MỚI: Lấy tất cả chuyến xe (Explore Mode)
  Future<void> fetchAllSchedules({
    double? minPrice,
    double? maxPrice,
    String? startTime,
    String? endTime,
    String? busType,
    int? brandId,
    String? dropoffPoint,
    String? sortBy,
  }) async {
    emit(state.copyWith(loading: true, error: null));
    try {
      final trips = await BookingApiService.fetchAllSchedules(
        minPrice: minPrice,
        maxPrice: maxPrice,
        startTime: startTime,
        endTime: endTime,
        busType: busType,
        brandId: brandId,
        dropoffPoint: dropoffPoint,
        sortBy: sortBy,
      );
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

  void selectSeat(Seat seat) {
    if (!seat.isAvailable) return;

    final selected = List<Seat>.from(state.selectedSeats);
    if (selected.contains(seat)) {
      selected.remove(seat);
    } else {
      selected.add(seat);
    }
    final total = selected.fold<double>(0.0, (sum, s) => sum + s.price);

    // Tính lại finalTotalPrice khi thay đổi số ghế
    final totalSurcharge = state.surcharge * selected.length;
    
    double newFinalTotalPrice = total + totalSurcharge - state.discountAmount;
    if (newFinalTotalPrice < 0) newFinalTotalPrice = 0;

    emit(state.copyWith(
      selectedSeats: selected,
      totalPrice: total,
      finalTotalPrice: newFinalTotalPrice,
    ));
  }

  void clearSelection() {
    emit(state.copyWith(
      selectedSeats: [],
      totalPrice: 0.0,
      finalTotalPrice: 0.0,
    ));
  }

  void resetSeats() {
    emit(state.copyWith(
      seats: [],
      selectedSeats: [],
      totalPrice: 0.0,
      finalTotalPrice: 0.0,
      loadingSeats: false,
      selectedDropoffPoint: null,
      dropoffAddress: null,
      surcharge: 0.0,
    ));
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
      finalTotalPrice: 0.0,
      loading: false,
      loadingSeats: false,
      selectedDropoffPoint: null,
      dropoffAddress: null,
      surcharge: 0.0,
    ));
  }

  // ================== MỚI: ĐIỂM TRẢ KHÁCH ==================
  void selectDropoffPoint(DropoffPoint point) {
    final totalSurcharge = point.surcharge * state.selectedSeats.length;
    double newFinalTotalPrice = state.totalPrice + totalSurcharge - state.discountAmount;
    if (newFinalTotalPrice < 0) newFinalTotalPrice = 0;

    emit(state.copyWith(
      selectedDropoffPoint: point,
      dropoffAddress: null,
      surcharge: point.surcharge,
      finalTotalPrice: newFinalTotalPrice,
    ));
  }

  void selectDropoffAddress(String address) {
    const deliveryFee = 150000.0; // phụ thu tận nơi
    final totalSurcharge = deliveryFee * state.selectedSeats.length;
    double newFinalTotalPrice = state.totalPrice + totalSurcharge - state.discountAmount;
    if (newFinalTotalPrice < 0) newFinalTotalPrice = 0;

    emit(state.copyWith(
      selectedDropoffPoint: null,
      dropoffAddress: address,
      surcharge: deliveryFee,
      finalTotalPrice: newFinalTotalPrice,
    ));
  }

  void clearDropoff() {
    emit(state.copyWith(
      selectedDropoffPoint: null,
      dropoffAddress: null,
      surcharge: 0.0,
      finalTotalPrice: state.totalPrice - state.discountAmount, // Vẫn giữ discount nếu có
    ));
  }

  // ================== MỚI: KHUYẾN MÃI ==================
  void applyPromotion(Promotion promotion, double discountAmount) {
    // Tính lại tổng tiền
    final totalSurcharge = state.surcharge * state.selectedSeats.length;
    final totalBeforeDiscount = state.totalPrice + totalSurcharge;
    
    double newFinalTotalPrice = totalBeforeDiscount - discountAmount;
    if (newFinalTotalPrice < 0) newFinalTotalPrice = 0;

    emit(state.copyWith(
      selectedPromotion: promotion,
      discountAmount: discountAmount,
      finalTotalPrice: newFinalTotalPrice,
    ));
  }

  void removePromotion() {
    // Tính lại tổng tiền (bỏ discount)
    final totalSurcharge = state.surcharge * state.selectedSeats.length;
    final newFinalTotalPrice = state.totalPrice + totalSurcharge;

    emit(state.copyWith(
      clearPromotion: true,
      discountAmount: 0.0,
      finalTotalPrice: newFinalTotalPrice,
    ));
  }
}