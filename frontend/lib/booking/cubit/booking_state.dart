import 'package:equatable/equatable.dart';

class BookingState extends Equatable {
  final String from;
  final String to;
  final DateTime date;
  final bool loading;
  final List<Trip> trips;
  final String? error;
  final List<Seat> seats;
  final List<Seat> selectedSeats;
  final double totalPrice;
  final Trip? selectedTrip;
  final bool loadingSeats;

  const BookingState({
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
  });

  factory BookingState.initial() => BookingState(
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
      );

  BookingState copyWith({
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
  }) {
    return BookingState(
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
    );
  }

  @override
  List<Object?> get props => [
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
      ];
}

// MODEL: Chuyến xe (schedule)
class Trip {
  final int id;
  final String busName;
  final String departure; // ISO string: "2025-11-11T20:00:00Z"
  final String arrival;
  final double price;
  final String category;
  final String seatType;
  final String status; // UPCOMING, FULL, FEW_SEATS, NEAR_DEPARTURE

  const Trip({
    required this.id,
    required this.busName,
    required this.departure,
    required this.arrival,
    required this.price,
    required this.category,
    required this.seatType,
    required this.status,
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
    );
  }

  static double _safeToDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  // ĐÃ THÊM: Tính thời gian còn lại (giờ)
  Duration get timeUntilDeparture {
    final departureTime = DateTime.parse(departure).toLocal();
    return departureTime.difference(DateTime.now());
  }

  bool get isNearDeparture => timeUntilDeparture.inMinutes < 60 && timeUntilDeparture.isNegative == false;
}

// MODEL: Ghế (seat)
class Seat {
  final int id;
  final String seatNumber;
  final String type; // 'SEAT' | 'BERTH'
  final String status; // 'AVAILABLE' | 'BOOKED'
  final double price;
  final int? floor;
  final String? roomType; // 'SINGLE' | 'DOUBLE'

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