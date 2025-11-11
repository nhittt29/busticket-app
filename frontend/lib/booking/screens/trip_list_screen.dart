import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';
import '../widgets/trip_card.dart';

const Color greenSoft = Color(0xFF66BB6A);
const Color iconBlue = Color(0xFF1976D2);
const Color backgroundLight = Color(0xFFEAF6FF);

class TripListScreen extends StatelessWidget {
  const TripListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final trips = ModalRoute.of(context)!.settings.arguments as List<Trip>;
    // LỌC CHỈ HIỂN THỊ CHUYẾN CÒN ĐẶT ĐƯỢC
    final bookableTrips = trips.where((t) => !t.isNearDeparture).toList();
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
            const Text(
              "Chọn chuyến xe",
              style: TextStyle(color: Color(0xFF023E8A), fontWeight: FontWeight.bold, fontSize: 24),
            ),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: iconBlue),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: bookableTrips.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.event_busy, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  const Text(
                    'Không có chuyến xe nào có thể đặt',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Các chuyến gần giờ khởi hành đã bị ẩn.',
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: bookableTrips.length,
              itemBuilder: (context, index) {
                final trip = bookableTrips[index];
                return Column(
                  children: [
                    TripCard(
                      trip: trip,
                      onTap: () {
                        context.read<BookingCubit>().selectTrip(trip);
                        Navigator.pushNamed(context, '/select-bus', arguments: trip.id);
                      },
                    ),
                    // HIỂN THỊ CẢNH BÁO NẾU FEW_SEATS
                    if (trip.status == 'FEW_SEATS')
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade100,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.orange),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.warning, size: 16, color: Colors.orange.shade700),
                            const SizedBox(width: 6),
                            Text(
                              'Còn ít ghế trống!',
                              style: TextStyle(color: Colors.orange.shade700, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                  ],
                );
              },
            ),
    );
  }
}