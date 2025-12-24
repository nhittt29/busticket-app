// lib/cubit/booking_state.dart
import 'package:equatable/equatable.dart';
import '../../booking/models/dropoff_point.dart';
import '../../promotions/models/promotion.dart';
import '../../models/route_model.dart';

class BookingState extends Equatable {
  final String from;
  final String to;
  final DateTime date;
  final bool loading;
  final List<Trip> trips;
  final String? error;
  final List<Seat> seats;
  final List<Seat> selectedSeats;
  final double totalPrice;           // tiền ghế gốc
  final Trip? selectedTrip;
  final bool loadingSeats;

  // ==== MỚI THÊM: ĐIỂM TRẢ KHÁCH ====
  final DropoffPoint? selectedDropoffPoint; // điểm cố định (VP, bến xe…)
  final String? dropoffAddress;             // nếu chọn tận nơi
  final double surcharge;                   // phụ thu mỗi người (0, 50k, 100k, 150k…)
  final double finalTotalPrice;              // totalPrice + (surcharge × số ghế) - discount

  // ==== MỚI THÊM: KHUYẾN MÃI ====
  final Promotion? selectedPromotion;
  final double discountAmount;
  final int? invalidSeatId; // ID ghế gây lỗi (ghế lẻ) để hiển thị effect X
  
  final int page;
  final bool hasReachedMax;


  final List<RouteModel> routes; // FULL LIST OF ROUTES
  final List<String> locations; // Keeping this for now or removing? User wants specific logic. Let's keep routes as source of truth.


  const BookingState({
    required this.routes,
    required this.locations,
    required this.from,
    required this.to,
    required this.date,
    required this.loading,
    required this.trips,
    this.error,
    required this.seats,
    required this.selectedSeats,
    required this.totalPrice,
    this.selectedTrip,
    required this.loadingSeats,
    this.selectedDropoffPoint,
    this.dropoffAddress,
    required this.surcharge,
    required this.finalTotalPrice,
    this.selectedPromotion,
    this.discountAmount = 0.0,
    this.dropoffDiscount = 0.0,
    this.surchargeReason,
    this.invalidSeatId,
    this.page = 1,
    this.hasReachedMax = false,
  });


  final String? surchargeReason;
  final double dropoffDiscount;

  factory BookingState.initial() => BookingState(
        routes: [],
        locations: [],
        from: '',
        to: '',
        date: DateTime.now(),
        loading: false,
        trips: [],
        error: null,
        seats: [],
        selectedSeats: [],
        totalPrice: 0.0,
        selectedTrip: null,
        loadingSeats: false,
        selectedDropoffPoint: null,
        dropoffAddress: null,
        surcharge: 0.0,
        finalTotalPrice: 0.0,
        selectedPromotion: null,
        discountAmount: 0.0,
        dropoffDiscount: 0.0,
        surchargeReason: null,
        invalidSeatId: null,
        page: 1,
        hasReachedMax: false,
      );


  BookingState copyWith({
    List<RouteModel>? routes,
    List<String>? locations,
    String? from,
    String? to,
    DateTime? date,
    bool? loading,
    List<Trip>? trips,
    String? error,
    List<Seat>? seats,
    List<Seat>? selectedSeats,
    double? totalPrice,
    Trip? selectedTrip,
    bool? loadingSeats,
    DropoffPoint? selectedDropoffPoint,
    String? dropoffAddress,
    double? surcharge,
    double? finalTotalPrice,
    Promotion? selectedPromotion,
    double? discountAmount,
    double? dropoffDiscount,
    bool clearPromotion = false,
    bool clearDropoff = false,
    String? surchargeReason,
    int? invalidSeatId,
    bool clearInvalidSeat = false,
    int? page,
    bool? hasReachedMax,
  }) {

    return BookingState(
      routes: routes ?? this.routes,
      locations: locations ?? this.locations,
      from: from ?? this.from,
      to: to ?? this.to,
      date: date ?? this.date,
      loading: loading ?? this.loading,
      trips: trips ?? this.trips,
      error: error,
      seats: seats ?? this.seats,
      selectedSeats: selectedSeats ?? this.selectedSeats,
      totalPrice: totalPrice ?? this.totalPrice,
      selectedTrip: selectedTrip ?? this.selectedTrip,
      loadingSeats: loadingSeats ?? this.loadingSeats,
      selectedDropoffPoint: clearDropoff ? null : (selectedDropoffPoint ?? this.selectedDropoffPoint),
      dropoffAddress: clearDropoff ? null : (dropoffAddress ?? this.dropoffAddress),
      surcharge: surcharge ?? this.surcharge,
      finalTotalPrice: finalTotalPrice ?? this.finalTotalPrice,
      selectedPromotion: clearPromotion ? null : (selectedPromotion ?? this.selectedPromotion),
      discountAmount: discountAmount ?? this.discountAmount,
      dropoffDiscount: dropoffDiscount ?? this.dropoffDiscount,
      surchargeReason: surchargeReason ?? this.surchargeReason,
      invalidSeatId: clearInvalidSeat ? null : (invalidSeatId ?? this.invalidSeatId),
      page: page ?? this.page,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
    );

  }

  @override
  List<Object?> get props => [
        routes,
        locations,
        from,
        to,
        date,
        loading,
        trips,
        error,
        seats,
        selectedSeats,
        totalPrice,
        selectedTrip,
        loadingSeats,
        selectedDropoffPoint,
        dropoffAddress,
        surcharge,
        finalTotalPrice,
        selectedPromotion,
        discountAmount,
        dropoffDiscount,
        surchargeReason,
        invalidSeatId,
        page,
        hasReachedMax,
      ];

}

// MODEL: Chuyến xe
class Trip {
  final int id;
  final String busName;
  final String departure;
  final String arrival;
  final double price;
  final String category;
  final String seatType;
  final String status;
  final double averageRating;
  final int totalReviews;
  final String startPoint;
  final String endPoint;
  final int availableSeats;
  final int totalSeats;

  const Trip({
    required this.id,
    required this.busName,
    required this.departure,
    required this.arrival,
    required this.price,
    required this.category,
    required this.seatType,
    required this.status,
    this.averageRating = 0.0,
    this.totalReviews = 0,
    required this.startPoint,
    required this.endPoint,
    this.availableSeats = 0,
    this.totalSeats = 0,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      id: json['id'] as int,
      busName: (json['bus']?['name'] as String?) ?? 'Không rõ',
      departure: json['departureAt'] as String,
      arrival: json['arrivalAt'] as String,
      price: _safeToDouble(json['lowestPrice'] ?? 0),
      category: (json['bus']?['category'] as String?) ?? 'Standard',
      seatType: (json['bus']?['seatType'] as String?) ?? 'SEAT',
      status: (json['status'] as String?) ?? 'UPCOMING',
      averageRating: _safeToDouble(json['bus']?['averageRating'] ?? 0),
      totalReviews: (json['bus']?['totalReviews'] as int?) ?? 0,
      startPoint: (json['route']?['startPoint'] as String?) ?? (json['startPoint'] as String?) ?? 'Điểm đi',
      endPoint: (json['route']?['endPoint'] as String?) ?? (json['endPoint'] as String?) ?? 'Điểm đến',
      availableSeats: (json['availableSeats'] as int?) ?? 0,
      totalSeats: (json['bus']?['seatCount'] as int?) ?? 40,
    );
  }

  static double _safeToDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  Duration get timeUntilDeparture {
    final departureTime = DateTime.parse(departure).toLocal();
    return departureTime.difference(DateTime.now());
  }

  bool get isNearDeparture => timeUntilDeparture.inMinutes < 60 && timeUntilDeparture.isNegative == false;
}

// MODEL: Ghế
class Seat {
  final int id;
  final String seatNumber;
  final String type;
  final String status;
  final double price;
  final int? floor;
  final String? roomType;

  const Seat({
    required this.id,
    required this.seatNumber,
    required this.type,
    required this.status,
    required this.price,
    this.floor,
    this.roomType,
  });

  bool get isAvailable => status == 'AVAILABLE';

  factory Seat.fromJson(Map<String, dynamic> json) {
    return Seat(
      id: json['id'] as int,
      seatNumber: (json['seatNumber'] ?? json['code'] ?? '').toString(),
      type: (json['seatType'] as String?) ?? 'SEAT',
      status: (json['isAvailable'] == true) ? 'AVAILABLE' : 'BOOKED',
      price: _safeToDouble(json['price'] ?? 0),
      floor: json['floor'] as int?,
      roomType: json['roomType'] as String?,
    );
  }

  static double _safeToDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }
}