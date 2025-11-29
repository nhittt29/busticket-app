// lib/booking/screens/explore_trips_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';
import '../widgets/trip_card.dart';
import '../widgets/filter_modal.dart';

const Color primaryBlue = Color(0xFF6AB7F5);
const Color accentBlue = Color(0xFF4A9EFF);
const Color deepBlue = Color(0xFF1976D2);
const Color pastelBlue = Color(0xFFA0D8F1);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color successGreen = Color(0xFF4CAF50);

class ExploreTripsScreen extends StatefulWidget {
  const ExploreTripsScreen({super.key});

  @override
  State<ExploreTripsScreen> createState() => _ExploreTripsScreenState();
}

class _ExploreTripsScreenState extends State<ExploreTripsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<BookingCubit>().fetchAllSchedules();
  }

  void _showFilterModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FilterModal(
        onApply: ({
          minPrice,
          maxPrice,
          startTime,
          endTime,
          busType,
          brandId,
          dropoffPoint,
          sortBy,
        }) {
          context.read<BookingCubit>().fetchAllSchedules(
                minPrice: minPrice,
                maxPrice: maxPrice,
                startTime: startTime,
                endTime: endTime,
                busType: busType,
                brandId: brandId,
                dropoffPoint: dropoffPoint,
                sortBy: sortBy,
              );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [primaryBlue, accentBlue],
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
        title: const Text(
          "Khám phá chuyến xe",
          style: TextStyle(
            color: Colors.white,
            fontSize: 23,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded, color: Colors.white, size: 28),
            onPressed: _showFilterModal,
            tooltip: "Lọc chuyến xe",
          ),
        ],
      ),
      body: BlocBuilder<BookingCubit, BookingState>(
        builder: (context, state) {
          // Loading
          if (state.loading) {
            return const Center(
              child: CircularProgressIndicator(color: primaryBlue, strokeWidth: 3),
            );
          }

          // Error
          if (state.error != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline_rounded, size: 80, color: Colors.red.shade400),
                    const SizedBox(height: 20),
                    Text(
                      'Đã có lỗi xảy ra',
                      style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: Colors.grey[800]),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      state.error!,
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 15, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () => context.read<BookingCubit>().fetchAllSchedules(),
                      icon: const Icon(Icons.refresh),
                      label: const Text('Thử lại', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryBlue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          // Empty state
          if (state.trips.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.directions_bus_rounded,
                      size: 100,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Không tìm thấy chuyến xe nào',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Hãy thử thay đổi bộ lọc hoặc tìm vào thời điểm khác',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            );
          }

          // Danh sách chuyến xe – ĐẸP, GỌN, CHUYÊN NGHIỆP
          return RefreshIndicator(
            onRefresh: () async => context.read<BookingCubit>().fetchAllSchedules(),
            color: primaryBlue,
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 100), // Đủ không gian cho nút floating nếu có
              itemCount: state.trips.length,
              itemBuilder: (context, index) {
                final trip = state.trips[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: pastelBlue.withAlpha(120), width: 1.3),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withAlpha(60),
                        blurRadius: 14,
                        offset: const Offset(0, 6),
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
                );
              },
            ),
          );
        },
      ),
    );
  }
}