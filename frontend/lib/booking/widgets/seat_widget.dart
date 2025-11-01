// lib/booking/widgets/seat_widget.dart
import 'package:flutter/material.dart';
import '../cubit/booking_state.dart'; // ĐÚNG: Lấy Seat từ đây

class SeatWidget extends StatelessWidget {
  final Seat seat;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isVip;

  const SeatWidget({
    super.key,
    required this.seat,
    required this.isSelected,
    required this.onTap,
    this.isVip = false,
  });

  @override
  Widget build(BuildContext context) {
    // XÁC ĐỊNH MÀU
    Color baseColor;
    if (isSelected) {
      baseColor = Colors.orange;
    } else if (seat.status == 'AVAILABLE') {
      baseColor = isVip ? Colors.amber : Colors.green;
    } else {
      baseColor = Colors.red;
    }

    final bool canTap = seat.status == 'AVAILABLE';

    return GestureDetector(
      onTap: canTap ? onTap : null,
      child: Container(
        width: 50,
        height: 50,
        margin: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: baseColor.withAlpha(50),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: baseColor, width: 2),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // ICON: Ghế hoặc Giường
            Icon(
              seat.type == 'SEAT' ? Icons.event_seat : Icons.bed,
              size: 20,
              color: baseColor,
            ),
            // SỐ GHẾ
            Text(
              seat.seatNumber,
              style: TextStyle(
                fontSize: 10,
                color: baseColor,
                fontWeight: FontWeight.bold,
              ),
            ),
            // TẦNG (T1, T2)
            if (seat.floor != null)
              Text(
                'T${seat.floor}',
                style: const TextStyle(fontSize: 8, color: Colors.grey),
              ),
            // LOẠI PHÒNG (S: Single, D: Double)
            if (seat.roomType != null)
              Text(
                seat.roomType == 'SINGLE' ? 'S' : 'D',
                style: const TextStyle(fontSize: 8, color: Colors.purple),
              ),
            // VIP
            if (isVip)
              const Text(
                'VIP',
                style: TextStyle(fontSize: 8, color: Colors.amber, fontWeight: FontWeight.bold),
              ),
          ],
        ),
      ),
    );
  }
}