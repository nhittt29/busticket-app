// lib/booking/cubit/booking_cubit.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/booking_api_service.dart';
import 'booking_state.dart';
import '../models/dropoff_point.dart';
import '../../promotions/models/promotion.dart';
import '../utils/seat_logic.dart';

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

    final schedule = state.selectedTrip;
    final isSeat45 = state.seats.length == 45 &&
        schedule?.category.toUpperCase() == 'COACH' &&
        schedule?.seatType.toUpperCase() == 'SEAT';
        
    final isSeat28 = state.seats.length == 28 &&
        schedule?.category.toUpperCase() == 'COACH' &&
        schedule?.seatType.toUpperCase() == 'SEAT';

    final selected = List<Seat>.from(state.selectedSeats);
    if (selected.contains(seat)) {
      // VALIDATE: Kiểm tra xem BỎ CHỌN có tạo ra ghế lẻ không?
      // Logic mới: Auto-Correction (Tự động bỏ chọn các ghế bị lẻ theo)
      
      final simulatedList = List<Seat>.from(selected)..removeWhere((s) => s.id == seat.id);
      
      // Tìm các ghế không hợp lệ còn lại
      final invalidSeats = SeatLogic.findInvalidSeats(state.seats, simulatedList, isCoach45: isSeat45, isCoach28: isSeat28);
      
      // Nếu có ghế không hợp lệ -> Bỏ chọn luôn chúng nó
      if (invalidSeats.isNotEmpty) {
         selected.removeWhere((s) => s.id == seat.id); // Bỏ ghế chính
         for (final invalid in invalidSeats) {
           selected.removeWhere((s) => s.id == invalid.id);
         }
         emit(state.copyWith(error: 'Đã tự động bỏ chọn ghế liên quan để tránh bị lẻ chỗ.'));
      } else {
         selected.removeWhere((s) => s.id == seat.id);
      }
    } else {
      // VALIDATE: Kiểm tra ghế lẻ (Orphan Logic)
      if (SeatLogic.wouldCreateOrphan(seat, state.seats, selected, isCoach45: isSeat45, isCoach28: isSeat28)) {
        emit(state.copyWith(error: 'Vui lòng chọn ghế liên tiếp, không để trống 1 ghế ở giữa hoặc bìa.'));
        return;
      }
      selected.add(seat);
    }
    final total = selected.fold<double>(0.0, (sum, s) => sum + s.price);

    // Tính lại finalTotalPrice khi thay đổi số ghế
    final totalSurcharge = state.surcharge * selected.length;
    final totalDropoffDiscount = state.dropoffDiscount * selected.length; // Mới
    
    double newFinalTotalPrice = total + totalSurcharge - totalDropoffDiscount - state.discountAmount;
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
      dropoffDiscount: 0.0, // Reset
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
      dropoffDiscount: 0.0, // Reset
    ));
  }

  // ================== MỚI: ĐIỂM TRẢ KHÁCH ==================
  // ================== MỚI: ĐIỂM TRẢ KHÁCH ==================
  void selectDropoffPoint(DropoffPoint point) {
    double surcharge = point.surcharge;
    double dropoffDiscount = 0.0; // Tách riêng khoản giảm giá
    final trip = state.selectedTrip;
    String reason = 'Giá vé tiêu chuẩn';

    // CLIENT-SIDE PRICING LOGIC (Match Backend)
    // 1. Check 24h window
    // 2. Check Occupancy < 80% (Available > 20%)
    if (trip != null && point.priceDifference != 0) {
       final departureTime = DateTime.parse(trip.departure).toLocal();
       final diffHours = departureTime.difference(DateTime.now()).inHours;
       
       if (diffHours < 24 && trip.totalSeats > 0) {
          final occupancyRate = (trip.totalSeats - trip.availableSeats) / trip.totalSeats;
          if (occupancyRate < 0.8) {
             // Đủ điều kiện: Tách phần giảm giá riêng
             dropoffDiscount = point.priceDifference.abs(); // Lấy số dương
             // Lưu ý: Backend cộng số âm, còn Frontend mình tách ra làm 2 biến dương để dễ hiển thị
             
             reason = 'Đang áp dụng giá ưu đãi chặng ngắn';
          } else {
             reason = 'Đang áp dụng giá giữ chỗ toàn chặng (Do xe sắp đầy)';
          }
       } else {
          reason = 'Đang áp dụng giá giữ chỗ toàn chặng (Do đặt sớm > 24h)';
       }
    }

    final totalSurcharge = surcharge * state.selectedSeats.length;
    final totalDropoffDiscount = dropoffDiscount * state.selectedSeats.length;

    double newFinalTotalPrice = state.totalPrice + totalSurcharge - totalDropoffDiscount - state.discountAmount;
    if (newFinalTotalPrice < 0) newFinalTotalPrice = 0;

    emit(state.copyWith(
      selectedDropoffPoint: point,
      dropoffAddress: null,
      surcharge: surcharge,
      dropoffDiscount: dropoffDiscount, // Lưu vào state
      finalTotalPrice: newFinalTotalPrice,
      surchargeReason: reason,
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
      dropoffDiscount: 0.0, // Reset discount
      finalTotalPrice: newFinalTotalPrice,
    ));
  }

  void clearDropoff() {
    emit(state.copyWith(
      selectedDropoffPoint: null,
      dropoffAddress: null,
      surcharge: 0.0,
      dropoffDiscount: 0.0, // Reset discount
      finalTotalPrice: state.totalPrice - state.discountAmount, // Vẫn giữ discount khuyến mãi nếu có
    ));
  }

  // ================== MỚI: KHUYẾN MÃI ==================
  void applyPromotion(Promotion promotion, double discountAmount) {
    // Tính lại tổng tiền
    // Tính lại tổng tiền
    final totalSurcharge = state.surcharge * state.selectedSeats.length;
    final totalDropoffDiscount = state.dropoffDiscount * state.selectedSeats.length;

    final totalBeforeDiscount = state.totalPrice + totalSurcharge - totalDropoffDiscount;
    
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
    final totalDropoffDiscount = state.dropoffDiscount * state.selectedSeats.length;

    final newFinalTotalPrice = state.totalPrice + totalSurcharge - totalDropoffDiscount;

    emit(state.copyWith(
      clearPromotion: true,
      discountAmount: 0.0,
      finalTotalPrice: newFinalTotalPrice,
    ));
  }
}