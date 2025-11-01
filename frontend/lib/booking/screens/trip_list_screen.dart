// lib/booking/screens/trip_list_screen.dart
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
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: iconBlue), onPressed: () => Navigator.pop(context)),
      ),
      body: trips.isEmpty
          ? const Center(child: Text('Không tìm thấy chuyến xe', style: TextStyle(fontSize: 16)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: trips.length,
              itemBuilder: (context, index) {
                final trip = trips[index];
                return TripCard(
                  trip: trip,
                  onTap: () {
                    context.read<BookingCubit>().selectTrip(trip);
                    Navigator.pushNamed(context, '/select-bus', arguments: trip.id);
                  },
                );
              },
            ),
    );
  }
}