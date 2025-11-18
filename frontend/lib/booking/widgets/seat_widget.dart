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
    // MÀU SẮC ĐỒNG BỘ – ĐÃ CHỈNH CAM NHẸ HƠN (từ #FF9800 → #FFB74D)
    const Color greenAvailable = Color(0xFF4CAF50);
    const Color orangeSelected = Color(0xFFFFB74D);   // MÀU CAM NHẸ, ĐẸP, KHÔNG CHÓI
    const Color redSold        = Color(0xFFEF5350);
    const Color greyBlocked    = Color(0xFFB0BEC5);
    const Color vipGold        = Color(0xFFFFD700);

    Color baseColor;
    Color borderColor;
    Color iconColor;
    Color textColor;
    Color backgroundColor;

    if (isSelected) {
      baseColor       = orangeSelected;
      borderColor     = orangeSelected;
      iconColor       = Colors.white;
      textColor       = Colors.white;
      backgroundColor = orangeSelected;
    } else if (seat.status == 'AVAILABLE') {
      baseColor       = isVip ? vipGold : greenAvailable;
      borderColor     = baseColor;
      iconColor       = baseColor;
      textColor       = baseColor;
      backgroundColor = baseColor.withOpacity(0.15);
    } else if (seat.status == 'BLOCKED') {
      baseColor       = greyBlocked;
      borderColor     = greyBlocked;
      iconColor       = greyBlocked;
      textColor       = greyBlocked;
      backgroundColor = greyBlocked.withOpacity(0.15);
    } else {
      baseColor       = redSold;
      borderColor     = redSold;
      iconColor       = redSold;
      textColor       = redSold;
      backgroundColor = redSold.withOpacity(0.15);
    }

    final bool canTap = seat.status == 'AVAILABLE';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        splashColor: baseColor.withOpacity(0.3),
        highlightColor: baseColor.withOpacity(0.15),
        onTap: canTap ? onTap : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 28,
          height: 28,
          margin: const EdgeInsets.all(1),
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: borderColor,
              width: isSelected ? 2.5 : 1.8,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: orangeSelected.withOpacity(0.45),
                      blurRadius: 9,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 3,
                      offset: const Offset(0, 1),
                    ),
                  ],
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
                    seat.type == 'SEAT' ? Icons.event_seat_rounded : Icons.bed_rounded,
                    size: 13,
                    color: iconColor,
                  ),
                  const SizedBox(height: 1),
                  Text(
                    seat.seatNumber,
                    style: TextStyle(
                      fontSize: 6.5,
                      color: textColor,
                      fontWeight: FontWeight.bold,
                      height: 1.0,
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                  if (seat.floor != null)
                    Text(
                      'T${seat.floor}',
                      style: const TextStyle(
                        fontSize: 5,
                        color: Colors.grey,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}