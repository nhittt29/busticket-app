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

  Future<void> loadLocations() async {
    try {
      final routes = await BookingApiService.fetchRoutes();
      // Store full routes for context-aware filtering
      emit(state.copyWith(routes: routes, locations: [])); 
    } catch (e) {
      print("Error loading locations: $e");
    }
  }

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

      if (filteredTrips.isEmpty) {
        emit(state.copyWith(error: 'Không tìm thấy chuyến xe nào phù hợp!', loading: false));
      } else {
        emit(state.copyWith(trips: filteredTrips, loading: false));
      }
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
    bool isLoadMore = false,
  }) async {
    if (isLoadMore && state.hasReachedMax) return;

    final nextPage = isLoadMore ? state.page + 1 : 1;
    
    // Only show full loading if fresh load, otherwise handled by isLoadMore UI logic or bottom spinner
    if (!isLoadMore) {
      emit(state.copyWith(loading: true, error: null));
    }

    try {
      final result = await BookingApiService.fetchAllSchedules(
        minPrice: minPrice,
        maxPrice: maxPrice,
        startTime: startTime,
        endTime: endTime,
        busType: busType,
        brandId: brandId,
        dropoffPoint: dropoffPoint,
        sortBy: sortBy,
        page: nextPage,
        limit: 10, // Fixed limit for now
      );

      final newTrips = result.trips;
      final total = result.total;
      final currentTrips = isLoadMore ? state.trips : <Trip>[];
      final allTrips = List<Trip>.from(currentTrips)..addAll(newTrips);

      emit(state.copyWith(
        trips: allTrips,
        loading: false,
        page: result.page,
        hasReachedMax: allTrips.length >= total,
      ));
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

  // ================== HELPER: TÍNH TOÁN LẠI GIÁ CUỐI CÙNG ==================
  // Hàm này trả về 1 state mới với các giá trị tiền đã được tính toán lại
  BookingState _recalculateState(BookingState currentState) {
    // 1. Tính tổng tiền ghế
    final totalSeatsPrice = currentState.selectedSeats.fold<double>(0.0, (sum, s) => sum + s.price);
    
    // 2. Tính phụ thu
    final totalSurcharge = currentState.surcharge * currentState.selectedSeats.length;
    
    // 3. Tính giảm giá điểm trả (chặng ngắn)
    final totalDropoffDiscount = currentState.dropoffDiscount * currentState.selectedSeats.length;

    // 4. Tổng trước khuyến mãi
    double totalBeforePromotion = totalSeatsPrice + totalSurcharge - totalDropoffDiscount;
    if (totalBeforePromotion < 0) totalBeforePromotion = 0;

    // 5. Tính khuyến mãi voucher
    double discountAmount = 0.0;
    final promo = currentState.selectedPromotion;
    
    if (promo != null) {
      // Kiểm tra điều kiện tối thiểu
      if (totalBeforePromotion >= promo.minOrderValue) {
        if (promo.discountType == 'PERCENTAGE') {
          discountAmount = totalBeforePromotion * (promo.discountValue / 100);
          if (promo.maxDiscount != null && discountAmount > promo.maxDiscount!) {
            discountAmount = promo.maxDiscount!;
          }
        } else {
          // FIXED
          discountAmount = promo.discountValue;
        }

        // Không giảm quá tổng tiền
        if (discountAmount > totalBeforePromotion) {
          discountAmount = totalBeforePromotion;
        }
      } else {
        // Nếu không đủ điều kiện đơn tối thiểu -> Discount = 0
        discountAmount = 0.0;
      }
    }

    // 6. Tổng cuối cùng
    double finalTotalPrice = totalBeforePromotion - discountAmount;
    if (finalTotalPrice < 0) finalTotalPrice = 0;

    return currentState.copyWith(
      totalPrice: totalSeatsPrice,
      discountAmount: discountAmount,
      finalTotalPrice: finalTotalPrice,
    );
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
      final simulatedList = List<Seat>.from(selected)..removeWhere((s) => s.id == seat.id);
      final invalidSeats = SeatLogic.findInvalidSeats(state.seats, simulatedList, isCoach45: isSeat45, isCoach28: isSeat28);
      
      if (invalidSeats.isNotEmpty) {
         selected.removeWhere((s) => s.id == seat.id);
         for (final invalid in invalidSeats) {
           selected.removeWhere((s) => s.id == invalid.id);
         }
         emit(state.copyWith(error: 'Đã tự động bỏ chọn ghế liên quan để tránh bị lẻ chỗ.'));
      } else {
         selected.removeWhere((s) => s.id == seat.id);
      }
    } else {
      if (selected.length >= 8) {
        emit(state.copyWith(error: 'Bạn chỉ được đặt tối đa 8 vé/ngày'));
        // Clear error after 2s
        Future.delayed(const Duration(seconds: 2), () {
           if (!isClosed) emit(state.copyWith(error: null));
        });
        return;
      }
      
      if (SeatLogic.wouldCreateOrphan(seat, state.seats, selected, isCoach45: isSeat45, isCoach28: isSeat28)) {
        // THAY ĐỔI: Không hiện SnackBar lỗi nữa, mà báo hiệu ghế này bị invalid (hiện X)
        emit(state.copyWith(invalidSeatId: seat.id));
        
        // Tự động tắt trạng thái invalid sau 1s
        Future.delayed(const Duration(milliseconds: 1000), () {
          if (!isClosed) {
            emit(state.copyWith(clearInvalidSeat: true));
          }
        });
        return;
      }
      selected.add(seat);
    }
    
    // Update seats list first, then recalculate prices
    final tempState = state.copyWith(selectedSeats: selected);
    emit(_recalculateState(tempState));
  }

  void clearSelection() {
    final tempState = state.copyWith(selectedSeats: []); // Total reset to 0
    emit(_recalculateState(tempState)); 
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
      dropoffDiscount: 0.0, 
      clearDropoff: true, 
      clearPromotion: true, 
      discountAmount: 0.0, 
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
      dropoffDiscount: 0.0,
    ));
  }

  // ================== MỚI: ĐIỂM TRẢ KHÁCH ==================
  void selectDropoffPoint(DropoffPoint point) {
    double surcharge = point.surcharge;
    double dropoffDiscount = 0.0; 
    final trip = state.selectedTrip;
    String reason = 'Giá vé tiêu chuẩn';

    // CLIENT-SIDE PRICING LOGIC
    if (trip != null && point.priceDifference != 0) {
       final departureTime = DateTime.parse(trip.departure).toLocal();
       final diffHours = departureTime.difference(DateTime.now()).inHours;
       
       if (diffHours < 24 && trip.totalSeats > 0) {
          final occupancyRate = (trip.totalSeats - trip.availableSeats) / trip.totalSeats;
          if (occupancyRate < 0.8) {
             dropoffDiscount = point.priceDifference.abs(); 
             reason = 'Đang áp dụng giá ưu đãi chặng ngắn';
          } else {
             reason = 'Đang áp dụng giá giữ chỗ toàn chặng (Do xe sắp đầy)';
          }
       } else {
          reason = 'Đang áp dụng giá giữ chỗ toàn chặng (Do đặt sớm > 24h)';
       }
    }

    final tempState = state.copyWith(
      selectedDropoffPoint: point,
      dropoffAddress: null,
      surcharge: surcharge,
      dropoffDiscount: dropoffDiscount,
      surchargeReason: reason,
      // NOTE: We don't set finalTotalPrice here, logic handles it
    );

    emit(_recalculateState(tempState));
  }

  void selectDropoffAddress(String address) {
    const deliveryFee = 150000.0; 
    final tempState = state.copyWith(
      selectedDropoffPoint: null,
      dropoffAddress: address,
      surcharge: deliveryFee,
      dropoffDiscount: 0.0, 
    );
    emit(_recalculateState(tempState));
  }

  void clearDropoff() {
    final tempState = state.copyWith(
      selectedDropoffPoint: null,
      dropoffAddress: null,
      surcharge: 0.0,
      dropoffDiscount: 0.0,
      clearDropoff: true,
    );
    emit(_recalculateState(tempState));
  }

  // ================== MỚI: KHUYẾN MÃI (AUTO-CALCULATE) ==================
  // Changed: Removed manual 'discountAmount' param. Now logic calculates it.
  void applyPromotion(Promotion promotion) {
    final tempState = state.copyWith(
      selectedPromotion: promotion,
    );
    emit(_recalculateState(tempState));
  }

  void removePromotion() {
    final tempState = state.copyWith(
      clearPromotion: true,
      discountAmount: 0.0, 
    );
    emit(_recalculateState(tempState));
  }
}
