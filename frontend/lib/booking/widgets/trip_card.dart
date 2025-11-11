// lib/widgets/trip_card.dart
import 'package:flutter/material.dart';
import '../cubit/booking_state.dart';

class TripCard extends StatelessWidget {
  final Trip trip;
  final VoidCallback onTap;
  const TripCard({super.key, required this.trip, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final status = trip.status;
    final canBook = status == 'UPCOMING' || status == 'FULL' || status == 'FEW_SEATS';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: canBook ? onTap : null,
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          trip.busName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                      _buildStatusChip(status),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildTime(trip.departure, 'Đi'),
                      const Icon(Icons.arrow_forward, color: Colors.grey),
                      _buildTime(trip.arrival, 'Đến'),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${(trip.price / 1000).toStringAsFixed(0)}k',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                      ),
                      Chip(
                        label: Text(
                          trip.seatType == 'SEAT' ? 'Ghế ngồi' : 'Giường nằm',
                          style: const TextStyle(fontSize: 12),
                        ),
                        backgroundColor: trip.seatType == 'SEAT' ? Colors.blue[50] : Colors.purple[50],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (!canBook)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTime(String isoTime, String label) {
    final time = DateTime.parse(isoTime).toLocal();
    return Column(
      children: [
        Text(
          '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }

  Widget _buildStatusChip(String status) {
    switch (status) {
      case 'UPCOMING':
        return _chip('Sắp khởi hành', Colors.orange, Icons.access_time);
      case 'ONGOING':
        return _chip('Đang di chuyển', Colors.blue, Icons.directions_bus);
      case 'COMPLETED':
        return _chip('Đã hoàn thành', Colors.green, Icons.check_circle);
      case 'FULL':
        return _chip('Hết ghế', Colors.red, Icons.block);
      case 'FEW_SEATS':
        return _chip('Ít ghế', Colors.orange, Icons.warning);
      default:
        return const SizedBox();
    }
  }

  Widget _chip(String label, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}