// lib/booking/screens/trip_list_screen.dart
import 'package:flutter/material.dart';
import '../cubit/booking_state.dart';

const Color greenSoft = Color(0xFF66BB6A);
const Color iconBlue = Color(0xFF1976D2);
const Color backgroundLight = Color(0xFFEAF6FF);

class TripListScreen extends StatelessWidget {
  const TripListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final trips = ModalRoute.of(context)!.settings.arguments as List<Trip>;

    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        backgroundColor: backgroundLight,
        elevation: 0,
        centerTitle: true,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('assets/images/bus_logo.png', height: 30),
            const SizedBox(width: 8),
            const Text("Chọn chuyến xe", style: TextStyle(color: Color(0xFF023E8A), fontWeight: FontWeight.bold, fontSize: 24)),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: iconBlue),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: trips.isEmpty
          ? const Center(child: Text('Không tìm thấy chuyến xe', style: TextStyle(fontSize: 16)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: trips.length,
              itemBuilder: (context, index) {
                final trip = trips[index];
                return _buildTripCard(context, trip);
              },
            ),
    );
  }

  Widget _buildTripCard(BuildContext context, Trip trip) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 6,
      shadowColor: greenSoft.withValues(alpha: 0.3),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () {
          Navigator.pushNamed(context, '/select-bus', arguments: trip.id);
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: greenSoft.withValues(alpha: 0.2),
                    child: Icon(
                      trip.seatType == 'SEAT' ? Icons.event_seat : Icons.bed,
                      color: iconBlue,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(trip.busName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text('${trip.category} • ${trip.seatType == 'SEAT' ? 'Ghế' : 'Giường'}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: greenSoft.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: greenSoft, width: 1.2),
                    ),
                    child: Text(
                      '${trip.price.toInt()}đ',
                      style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),
              Row(
                children: [
                  Expanded(child: Text(trip.departure.split('T')[1].substring(0, 5), style: const TextStyle(fontWeight: FontWeight.bold))),
                  const Icon(Icons.arrow_forward, color: iconBlue),
                  Expanded(child: Text(trip.arrival.split('T')[1].substring(0, 5), textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.bold))),
                ],
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.pushNamed(context, '/select-bus', arguments: trip.id),
                  icon: const Icon(Icons.directions_bus, size: 18),
                  label: const Text('Chọn chuyến'),
                  style: ElevatedButton.styleFrom(backgroundColor: greenSoft, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}