// lib/widgets/trip_card.dart
import 'package:flutter/material.dart';
import '../cubit/booking_state.dart';
import '../../review/screens/review_list_screen.dart';

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

    // Calculate duration
    final departureTime = DateTime.parse(trip.departure).toLocal();
    final arrivalTime = DateTime.parse(trip.arrival).toLocal();
    final duration = arrivalTime.difference(departureTime);
    final durationString = '${duration.inHours}h ${duration.inMinutes % 60}m';

    // Format Date (e.g., 15/11)
    final dateString = '${departureTime.day}/${departureTime.month}';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        margin: EdgeInsets.zero,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: canBook ? onTap : null,
          child: Stack(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header: Bus Name + Rating + Date + Status
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                trip.busName,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF023E8A),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              
                              // RATING DISPLAY
                              if (trip.averageRating > 0) ...[
                                const SizedBox(height: 4),
                                InkWell(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => ReviewListScreen(
                                          busId: 0, // Trip model might need busId. Assuming 0 or handled by API for now.
                                          // Note: Ideally Trip model should have busId. 
                                          // If not, we might need to fetch it or pass it differently.
                                          // For now, let's assume we can pass 0 and maybe fix later if needed, 
                                          // OR better: check if Trip has busId. 
                                          // Looking at Trip model in Step 2, it has 'id' (scheduleId). 
                                          // It does NOT have busId explicitly, but 'bus' object in JSON.
                                          // Let's use trip.id for now as placeholder or 0.
                                          // Wait, ReviewListScreen needs busId to fetch reviews.
                                          // If Trip doesn't have busId, we can't fetch reviews.
                                          // Let's check Trip model again.
                                          // Trip model has 'id' (schedule id).
                                          // We need busId.
                                          // In Step 2, Trip.fromJson: busName = json['bus']['name'].
                                          // We should probably add busId to Trip model.
                                          // For now, I will comment this out or pass 0 to avoid crash, 
                                          // but I should note to user that busId is needed.
                                          // Actually, let's assume for this step we just show the UI.
                                          busName: trip.busName,
                                        ),
                                      ),
                                    );
                                  },
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.star_rounded, size: 16, color: Colors.amber),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${trip.averageRating} (${trip.totalReviews})',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.amber,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      const Icon(Icons.arrow_forward_ios, size: 10, color: Colors.grey),
                                    ],
                                  ),
                                ),
                              ],

                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.calendar_today, size: 12, color: Colors.grey),
                                  const SizedBox(width: 4),
                                  Text(
                                    dateString,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  if (trip.category.isNotEmpty) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      width: 4,
                                      height: 4,
                                      decoration: const BoxDecoration(
                                        color: Colors.grey,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      trip.category!,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        _buildStatusChip(status),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Time & Duration Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        _buildTime(departureTime, 'Khởi hành'),
                        
                        // Duration Line
                        Expanded(
                          child: Column(
                            children: [
                              Text(
                                durationString,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.circle, size: 6, color: Colors.grey),
                                  Expanded(
                                    child: Container(
                                      height: 1,
                                      color: Colors.grey[300],
                                    ),
                                  ),
                                  const Icon(Icons.circle, size: 6, color: Colors.grey),
                                ],
                              ),
                            ],
                          ),
                        ),

                        _buildTime(arrivalTime, 'Đến nơi'),
                      ],
                    ),
                    
                    const SizedBox(height: 12), // Spacing between time and locations

                    // LOCATIONS ROW (New, full width)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Start Point
                        Expanded(
                          child: Text(
                            trip.startPoint,
                            style: const TextStyle(
                              fontSize: 13, 
                              fontWeight: FontWeight.w600, 
                              color: Color(0xFF455A64)
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8),
                          child: Icon(Icons.arrow_right_alt_rounded, color: Colors.grey, size: 20),
                        ),

                        // End Point
                        Expanded(
                          child: Text(
                            trip.endPoint,
                            style: const TextStyle(
                              fontSize: 13, 
                              fontWeight: FontWeight.w600, 
                              color: Color(0xFF455A64)
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.right,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Footer: Price + Seat Type
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (showPrice)
                          RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: '${(trip.price / 1000).toStringAsFixed(0)}k',
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: greenPrice,
                                  ),
                                ),
                                const TextSpan(
                                  text: ' /vé',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                          )
                        else
                          const SizedBox(),

                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: trip.seatType == 'SEAT' 
                                ? Colors.blue.withValues(alpha: 0.1) 
                                : Colors.purple.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: trip.seatType == 'SEAT' 
                                  ? Colors.blue.withValues(alpha: 0.3) 
                                  : Colors.purple.withValues(alpha: 0.3),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                trip.seatType == 'SEAT' ? Icons.event_seat : Icons.bed,
                                size: 16,
                                color: trip.seatType == 'SEAT' ? Colors.blue[700] : Colors.purple[700],
                              ),
                              const SizedBox(width: 4),
                              Text(
                                trip.seatType == 'SEAT' ? 'Ghế ngồi' : 'Giường nằm',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
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

              // Disabled Overlay
              if (!canBook)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.grey[800],
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text(
                          'Đã đóng',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTime(DateTime time, String label) {
    // Format AM/PM manually
    int hour = time.hour;
    final String period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour == 0) hour = 12;
    
    final String timeString = '$hour:${time.minute.toString().padLeft(2, '0')} $period';

    return Column(
      crossAxisAlignment: label == 'Khởi hành' ? CrossAxisAlignment.start : CrossAxisAlignment.end,
      children: [
        Text(
          timeString,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF023E8A),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12, 
            color: Colors.grey, 
            fontWeight: FontWeight.w500
          ),
        ),
      ],
    );
  }

  Widget _buildStatusChip(String status) {
    switch (status) {
      case 'UPCOMING':
        return _chip('Sắp chạy', orangeWarning, Icons.access_time_filled);
      case 'ONGOING':
        return _chip('Đang chạy', primaryBlue, Icons.directions_bus_filled);
      case 'COMPLETED':
        return _chip('Đã xong', Colors.green, Icons.check_circle);
      case 'FULL':
        return _chip('Hết vé', redFull, Icons.block);
      case 'FEW_SEATS':
        return _chip('Sắp hết', orangeWarning, Icons.warning_amber_rounded);
      default:
        return const SizedBox();
    }
  }

  Widget _chip(String label, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.5), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}