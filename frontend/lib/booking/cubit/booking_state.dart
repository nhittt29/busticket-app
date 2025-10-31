// lib/booking/cubit/booking_state.dart
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

  // Không dùng const vì List<Trip>, List<Seat> không phải const
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

// MODEL: Chuyến xe (dùng cho danh sách tìm kiếm)
class Trip {
  final int id;
  final String busName;
  final String departure;
  final String arrival;
  final double price; // lowestPrice
  final String category;
  final String seatType;

  const Trip({
    required this.id,
    required this.busName,
    required this.departure,
    required this.arrival,
    required this.price,
    required this.category,
    required this.seatType,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    return Trip(
      id: json['id'],
      busName: json['bus']['name'],
      departure: json['departureAt'],
      arrival: json['arrivalAt'],
      price: json['lowestPrice'].toDouble(),
      category: json['bus']['category'],
      seatType: json['bus']['seatType'],
    );
  }
}

// MODEL: Ghế (hỗ trợ phân tầng cho giường nằm)
class Seat {
  final int id;
  final String seatNumber;
  final String type;     // SEAT | BERTH
  final String status;   // AVAILABLE | BOOKED
  final double price;
  final int floor;       // 1 hoặc 2 (chỉ dùng cho BERTH)

  const Seat({
    required this.id,
    required this.seatNumber,
    required this.type,
    required this.status,
    required this.price,
    required this.floor,
  });

  bool get isAvailable => status == 'AVAILABLE';

  factory Seat.fromJson(Map<String, dynamic> json) {
    return Seat(
      id: json['id'],
      seatNumber: json['seatNumber'],
      type: json['seatType'],
      status: json['status'],
      price: json['price'].toDouble(),
      floor: json['floor'] ?? 1, // Mặc định tầng 1 nếu backend không trả về
    );
  }
}