// lib/booking/screens/select_bus_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';

const Color greenSoft = Color(0xFF66BB6A);
const Color iconBlue = Color(0xFF1976D2);
const Color backgroundLight = Color(0xFFEAF6FF);

class SelectBusScreen extends StatefulWidget {
  final int scheduleId;
  const SelectBusScreen({super.key, required this.scheduleId});

  @override
  State<SelectBusScreen> createState() => _SelectBusScreenState();
}

class _SelectBusScreenState extends State<SelectBusScreen> {
  @override
  void initState() {
    super.initState();
    context.read<BookingCubit>().loadSeats(widget.scheduleId);
  }

  void _toggleSeat(Seat seat) {
    if (seat.status != 'AVAILABLE') return;
    context.read<BookingCubit>().selectSeat(seat);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        backgroundColor: backgroundLight,
        elevation: 0,
        title: const Text('Chọn ghế', style: TextStyle(color: Color(0xFF023E8A), fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: iconBlue),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: BlocConsumer<BookingCubit, BookingState>(
        listener: (context, state) {
          if (state.error != null && !state.loadingSeats) {
            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.error!), backgroundColor: Colors.red),
            );
          }
        },
        builder: (context, state) {
          if (state.loadingSeats) return const Center(child: CircularProgressIndicator());

          final seatType = state.seats.isNotEmpty ? state.seats.first.type : 'SEAT';

          return Column(
            children: [
              // Tiêu đề loại xe
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.grey.withValues(alpha: 0.2), blurRadius: 10)],
                ),
                child: Row(
                  children: [
                    Icon(seatType == 'SEAT' ? Icons.event_seat : Icons.bed, color: iconBlue, size: 40),
                    const SizedBox(width: 16),
                    Text(
                      seatType == 'SEAT' ? 'Xe ghế ngồi' : 'Xe giường nằm',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ],
                ),
              ),

              // SƠ ĐỒ GHẾ
              Expanded(
                child: seatType == 'SEAT'
                    ? _buildSeatGrid(state.seats, 1)
                    : _buildBerthFloors(state.seats),
              ),

              // Tổng tiền
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [BoxShadow(color: Colors.grey.withValues(alpha: 0.2), blurRadius: 10)],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${state.selectedSeats.length} ghế', style: const TextStyle(fontSize: 14)),
                          Text(
                            'Tổng: ${state.totalPrice.toInt()}đ',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: state.selectedSeats.isEmpty ? null : () => Navigator.pushNamed(context, '/payment'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: greenSoft,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                      ),
                      child: const Text('Tiếp theo', style: TextStyle(fontSize: 16)),
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

  // GRID GHẾ NGỒI
  Widget _buildSeatGrid(List<Seat> seats, int floor) {
    final floorSeats = seats.where((s) => s.floor == floor).toList();
    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 5,
        childAspectRatio: 1.2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: floorSeats.length,
      itemBuilder: (context, index) => _buildSeatWidget(floorSeats[index]),
    );
  }

  // PHÂN TẦNG GIƯỜNG NẰM
  Widget _buildBerthFloors(List<Seat> seats) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        _buildFloorSection('Tầng 1', seats.where((s) => s.floor == 1).toList()),
        const SizedBox(height: 24),
        _buildFloorSection('Tầng 2', seats.where((s) => s.floor == 2).toList()),
      ],
    );
  }

  Widget _buildFloorSection(String title, List<Seat> floorSeats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        ),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4,
            childAspectRatio: 2.0,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: floorSeats.length,
          itemBuilder: (context, index) => _buildSeatWidget(floorSeats[index]),
        ),
      ],
    );
  }

  Widget _buildSeatWidget(Seat seat) {
    final isSelected = context.read<BookingCubit>().state.selectedSeats.contains(seat);
    final color = isSelected
        ? Colors.orange
        : seat.status == 'BOOKED'
            ? Colors.red
            : greenSoft;

    return GestureDetector(
      onTap: () => _toggleSeat(seat),
      child: Container(
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color, width: 1.5),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              seat.type == 'SEAT' ? Icons.event_seat : Icons.bed,
              color: color,
              size: 24,
            ),
            Text(seat.seatNumber, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
            Text('${(seat.price / 1000).toInt()}k', style: TextStyle(color: color, fontSize: 10)),
          ],
        ),
      ),
    );
  }
}