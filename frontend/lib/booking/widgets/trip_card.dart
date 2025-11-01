// lib/booking/widgets/trip_card.dart
import 'package:flutter/material.dart';
import '../cubit/booking_state.dart';

class TripCard extends StatelessWidget {
  final Trip trip;
  final VoidCallback onTap;

  const TripCard({super.key, required this.trip, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(trip.busName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
                  Text('${(trip.price / 1000).toStringAsFixed(0)}k', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                  Chip(
                    label: Text(trip.seatType == 'SEAT' ? 'Ghế ngồi' : 'Giường nằm', style: const TextStyle(fontSize: 12)),
                    backgroundColor: trip.seatType == 'SEAT' ? Colors.blue[50] : Colors.purple[50],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTime(String isoTime, String label) {
    final time = DateTime.parse(isoTime).toLocal();
    return Column(
      children: [
        Text('${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}', style: const TextStyle(fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }
}