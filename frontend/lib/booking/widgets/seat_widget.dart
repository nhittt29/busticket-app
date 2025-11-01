// lib/booking/widgets/seat_widget.dart
import 'package:flutter/material.dart';
import '../cubit/booking_state.dart';

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
        width: 40,  // NHỎ HƠN
        height: 40, // NHỎ HƠN
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          color: baseColor.withAlpha(50),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: baseColor, width: 1.5),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              seat.type == 'SEAT' ? Icons.event_seat : Icons.bed,
              size: 16,
              color: baseColor,
            ),
            Text(
              seat.seatNumber,
              style: TextStyle(
                fontSize: 8,
                color: baseColor,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (seat.floor != null)
              Text(
                'T${seat.floor}',
                style: const TextStyle(fontSize: 7, color: Colors.grey),
              ),
          ],
        ),
      ),
    );
  }
}