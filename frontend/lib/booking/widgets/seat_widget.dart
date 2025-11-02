// lib/booking/widgets/seat_widget.dart
import 'package:flutter/material.dart';
import '../cubit/booking_state.dart';

class SeatWidget extends StatelessWidget {
  final Seat seat;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isVip;
  final double scale;

  const SeatWidget({
    super.key,
    required this.seat,
    required this.isSelected,
    required this.onTap,
    this.isVip = false,
    this.scale = 1.0,
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
        width: 28,   // CỐ ĐỊNH KÍCH THƯỚC
        height: 28,
        margin: const EdgeInsets.all(1),
        decoration: BoxDecoration(
          color: baseColor.withAlpha(50),
          borderRadius: BorderRadius.circular(5),
          border: Border.all(color: baseColor, width: 1),
        ),
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: SizedBox(
            width: 28 / scale,
            height: 28 / scale,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  seat.type == 'SEAT' ? Icons.event_seat : Icons.bed,
                  size: 12,
                  color: baseColor,
                ),
                Text(
                  seat.seatNumber,
                  style: TextStyle(
                    fontSize: 6,
                    color: baseColor,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                if (seat.floor != null)
                  Text(
                    'T${seat.floor}',
                    style: const TextStyle(
                      fontSize: 5,
                      color: Colors.grey,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}