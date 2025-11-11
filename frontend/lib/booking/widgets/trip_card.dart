import 'package:flutter/material.dart';
import '../cubit/booking_state.dart';

class TripCard extends StatelessWidget {
  final Trip trip;
  final VoidCallback onTap;
  const TripCard({super.key, required this.trip, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isNearDeparture = trip.isNearDeparture;
    final canBook = !isNearDeparture;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: canBook ? onTap : () => _showWarningDialog(context),
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    trip.busName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
                  if (isNearDeparture) ...[
                    const SizedBox(height: 8),
                    _buildWarningBadge(),
                  ],
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

  Widget _buildWarningBadge() {
    final minutesLeft = trip.timeUntilDeparture.inMinutes;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.red.shade300),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.access_time, size: 16, color: Colors.red.shade700),
          const SizedBox(width: 6),
          Text(
            'Còn $minutesLeft phút khởi hành',
            style: TextStyle(color: Colors.red.shade700, fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  void _showWarningDialog(BuildContext context) {
    final minutesLeft = trip.timeUntilDeparture.inMinutes;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        icon: Icon(Icons.warning_amber, color: Colors.orange.shade700, size: 32),
        title: const Text('Xe sắp khởi hành'),
        content: Text(
          'Chuyến xe này chỉ còn $minutesLeft phút để khởi hành.\n\n'
          'Theo quy định, bạn chỉ có thể đặt vé trước ít nhất 1 giờ.\n\n'
          'Vui lòng chọn chuyến xe khác.',
          style: const TextStyle(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK', style: TextStyle(color: Colors.blue)),
          ),
        ],
      ),
    );
  }
}