// lib/booking/models/dropoff_point.dart
class DropoffPoint {
  final int id;
  final String name;
  final String address;
  final double surcharge;

  const DropoffPoint({
    required this.id,
    required this.name,
    required this.address,
    required this.surcharge,
  });

  factory DropoffPoint.fromJson(Map<String, dynamic> json) {
    return DropoffPoint(
      id: json['id'] as int,
      name: json['name'] as String,
      address: json['address'] as String,
      surcharge: (json['surcharge'] ?? 0).toDouble(),
    );
  }

  // Điểm mặc định (bến xe chính) – miễn phí
  bool get isDefault => id == 0;

  String get displayName {
    if (isDefault) {
      return "Bến xe (mặc định – miễn phí)";
    }

    final int amount = surcharge.toInt();
    if (amount >= 1000) {
      final String kValue = (amount / 1000).toStringAsFixed(0);
      return "$name (+${kValue}kđ/người)";
    } else {
      return "$name (+${amount}đ/người)";
    }
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is DropoffPoint && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}