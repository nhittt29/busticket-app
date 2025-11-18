// lib/screens/trip_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';
import '../widgets/trip_card.dart';

const Color primaryGradientStart = Color(0xFF6AB7F5);
const Color primaryGradientEnd = Color(0xFF4A9EFF);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color primaryBlue = Color(0xFF1976D2);
const Color greenSuccess = Color(0xFF4CAF50);

class TripListScreen extends StatelessWidget {
  const TripListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final trips = ModalRoute.of(context)!.settings.arguments as List<Trip>;

    // CHỈ HIỂN THỊ CHUYẾN CÓ THỂ ĐẶT ĐƯỢC
    final bookableTrips = trips.where((t) {
      return t.status == 'UPCOMING' ||
             t.status == 'FULL' ||
             t.status == 'FEW_SEATS';
    }).toList();

    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [primaryGradientStart, primaryGradientEnd],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset('assets/images/bus_logo.png', height: 38),
            const SizedBox(width: 12),
            const Text(
              "Chọn chuyến xe",
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
      body: bookableTrips.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.event_busy_rounded,
                    size: 90,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Không tìm thấy chuyến xe phù hợp',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF023E8A),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Các chuyến đã khởi hành hoặc gần giờ sẽ không hiển thị',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 32),
                  OutlinedButton.icon(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back, color: primaryBlue),
                    label: const Text('Tìm lại chuyến khác'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: primaryBlue,
                      side: BorderSide(color: primaryBlue, width: 2),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
              itemCount: bookableTrips.length,
              itemBuilder: (context, index) {
                final trip = bookableTrips[index];
                final bool isFewSeats = trip.status == 'FEW_SEATS';

                return Column(
                  children: [
                    // CARD CHUYẾN XE
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.22),
                            blurRadius: 16,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: TripCard(
                        trip: trip,
                        onTap: () {
                          context.read<BookingCubit>().selectTrip(trip);
                          Navigator.pushNamed(context, '/select-bus', arguments: trip.id);
                        },
                      ),
                    ),

                    // CẢNH BÁO CÒN ÍT GHẾ
                    if (isFewSeats)
                      Container(
                        margin: const EdgeInsets.only(bottom: 20),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF3E0),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFFF8A65), width: 1.5),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.warning_amber_rounded, color: Color(0xFFFF6D00), size: 28),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'Cảnh báo: Chỉ còn rất ít ghế trống! Đặt ngay kẻo hết nhé!',
                                style: TextStyle(
                                  color: const Color(0xFFE65100),
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
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