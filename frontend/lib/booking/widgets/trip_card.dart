// lib/widgets/trip_card.dart
import 'package:flutter/material.dart';
import '../cubit/booking_state.dart';

const Color primaryBlue = Color(0xFF1976D2);
const Color greenPrice = Color(0xFF4CAF50);
const Color orangeWarning = Color(0xFFFF9800);
const Color redFull = Color(0xFFEF5350);

class TripCard extends StatelessWidget {
  final Trip trip;
  final VoidCallback onTap;

  const TripCard({
    super.key,
    required this.trip,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final status = trip.status;
    final canBook = status == 'UPCOMING' || status == 'FULL' || status == 'FEW_SEATS';
    final bool showPrice = trip.price > 0;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6), // Giảm từ 9 → 6
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16), // Giảm từ 20 → 16
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: EdgeInsets.zero,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: canBook ? onTap : null,
          child: Stack(
            children: [
              Padding(
                padding: const EdgeInsets.all(14), // Giảm từ 18 → 14 (tiết kiệm không gian)
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Tên xe + trạng thái
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            trip.busName,
                            style: const TextStyle(
                              fontSize: 16.5,           // Giảm nhẹ từ 18
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF023E8A),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 10),
                        _buildStatusChip(status),
                      ],
                    ),
                    const SizedBox(height: 12), // Giảm từ 16

                    // Giờ đi - đến
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildTime(trip.departure, 'Khởi hành'),
                        const Icon(Icons.arrow_forward_ios_rounded, color: Colors.grey, size: 18),
                        _buildTime(trip.arrival, 'Đến nơi'),
                      ],
                    ),
                    const SizedBox(height: 14), // Giảm từ 20

                    // Giá + loại ghế
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (showPrice)
                          Text(
                            '${(trip.price / 1000).toStringAsFixed(0)}k',
                            style: TextStyle(
                              fontSize: 24,              // Giảm từ 26 → 24
                              fontWeight: FontWeight.bold,
                              color: greenPrice,
                            ),
                          )
                        else
                          const SizedBox(width: 70), // Giữ chỗ vừa đủ

                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), // Thu gọn
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: trip.seatType == 'SEAT'
                                  ? [Colors.blue[100]!, Colors.blue[50]!]
                                  : [Colors.purple[100]!, Colors.purple[50]!],
                            ),
                            borderRadius: BorderRadius.circular(30),
                            border: Border.all(
                              color: trip.seatType == 'SEAT' ? Colors.blue[300]! : Colors.purple[300]!,
                              width: 1.4,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                trip.seatType == 'SEAT' ? Icons.event_seat : Icons.bed,
                                size: 18,
                                color: trip.seatType == 'SEAT' ? Colors.blue[700] : Colors.purple[700],
                              ),
                              const SizedBox(width: 5),
                              Text(
                                trip.seatType == 'SEAT' ? 'Ghế ngồi' : 'Giường nằm',
                                style: TextStyle(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.bold,
                                  color: trip.seatType == 'SEAT' ? Colors.blue[800] : Colors.purple[800],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Lớp mờ khi không đặt được
              if (!canBook)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.grey.withOpacity(0.45),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Center(
                      child: Icon(Icons.lock_outline_rounded, size: 48, color: Colors.grey),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTime(String isoTime, String label) {
    final time = DateTime.parse(isoTime).toLocal();
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');

    return Column(
      children: [
        Text(
          '$hour:$minute',
          style: const TextStyle(
            fontSize: 20,                    // Giảm từ 22 → 20
            fontWeight: FontWeight.bold,
            color: Color(0xFF023E8A),
          ),
        ),
        const SizedBox(height: 3),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }

  Widget _buildStatusChip(String status) {
    switch (status) {
      case 'UPCOMING':
        return _chip('Sắp khởi hành', orangeWarning, Icons.access_time_filled);
      case 'ONGOING':
        return _chip('Đang chạy', primaryBlue, Icons.directions_bus_filled);
      case 'COMPLETED':
        return _chip('Hoàn thành', Colors.green, Icons.check_circle);
      case 'FULL':
        return _chip('Hết ghế', redFull, Icons.block);
      case 'FEW_SEATS':
        return _chip('Còn ít ghế', orangeWarning, Icons.warning_amber_rounded);
      default:
        return const SizedBox();
    }
  }

  Widget _chip(String label, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7), // Thu gọn
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: color.withOpacity(0.6), width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 17, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(color: color, fontSize: 12.5, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}