// lib/booking/screens/select_bus_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';
import '../widgets/seat_widget.dart';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        backgroundColor: backgroundLight,
        elevation: 0,
        title: const Text(
          'Chọn giường',
          style: TextStyle(color: Color(0xFF023E8A), fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: iconBlue),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: BlocListener<BookingCubit, BookingState>(
        listener: (context, state) {
          if (state.error != null && !state.loadingSeats) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.error!), backgroundColor: Colors.red),
            );
          }
        },
        child: BlocBuilder<BookingCubit, BookingState>(
          buildWhen: (prev, curr) =>
              prev.seats != curr.seats ||
              prev.selectedSeats != curr.selectedSeats ||
              prev.loadingSeats != curr.loadingSeats,
          builder: (context, state) {
            if (state.loadingSeats) {
              return const Center(child: CircularProgressIndicator());
            }

            final seatType = state.seats.isNotEmpty ? state.seats.first.type : 'SEAT';
            final ticketPrice = state.seats.isNotEmpty ? state.seats.first.price : 0.0;

            return Column(
              children: [
                _buildLegend(ticketPrice, state.selectedSeats.isNotEmpty),
                const SizedBox(height: 16),
                Expanded(
                  child: seatType == 'BERTH'
                      ? _buildBerthLayout(context, state.seats, state.selectedSeats)
                      : _buildSeatLayout(context, state.seats, state.selectedSeats),
                ),
                _buildBottomBar(state),
              ],
            );
          },
        ),
      ),
    );
  }

  // CHÚ THÍCH
  Widget _buildLegend(double price, bool hasSelected) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 8)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Chú thích', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: [
              _legendItem(Icons.bed, Colors.green, 'Giường trống', '${price.toInt()}đ'),
              _legendItem(Icons.bed, Colors.red, 'Giường đã bán'),
              if (hasSelected) _legendItem(Icons.check_circle, Colors.orange, 'Đang chọn'),
              _legendItem(Icons.close, Colors.grey, 'Không bán'),
              _legendItem(Icons.star, Colors.amber, 'VIP'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _legendItem(IconData icon, Color color, String label, [String? price]) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 20, color: color),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
        if (price != null)
          Text(' $price', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }

  // XE GIƯỜNG NẰM: TỰ ĐỘNG NHẬN DIỆN 22, 34, 41, 45 GIƯỜNG
  Widget _buildBerthLayout(BuildContext blocContext, List<Seat> seats, List<Seat> selectedSeats) {
    final totalSeats = seats.length;

    // PHÂN LOẠI THEO TẦNG
    final upperBerths = seats.where((s) => s.floor == 2).toList()..sort((a, b) => a.id.compareTo(b.id));
    final lowerBerths = seats.where((s) => s.floor == 1).toList()..sort((a, b) => a.id.compareTo(b.id));

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // TẦNG 2 (TRÊN)
          if (upperBerths.isNotEmpty)
            _buildFloorSection(
              'Tầng 2',
              upperBerths,
              blocContext,
              selectedSeats,
              isUpper: true,
              totalSeats: totalSeats,
            ),
          const SizedBox(height: 24),
          // TẦNG 1 (DƯỚI)
          _buildFloorSection(
            'Tầng 1',
            lowerBerths,
            blocContext,
            selectedSeats,
            isUpper: false,
            totalSeats: totalSeats,
          ),
        ],
      ),
    );
  }

  Widget _buildFloorSection(
    String title,
    List<Seat> berths,
    BuildContext context,
    List<Seat> selectedSeats, {
    required bool isUpper,
    required int totalSeats,
  }) {
    final is22Berths = totalSeats == 22;
    final is34Berths = totalSeats == 34;
    final is41Berths = totalSeats == 41;
    final is45Berths = totalSeats == 45;

    int bedsPerRow;
    int leftBeds;
    int vipRows = 0;

    if (is22Berths) {
      bedsPerRow = 5;
      leftBeds = 2;
    } else if (is34Berths || is41Berths) {
      bedsPerRow = 6;
      leftBeds = 3;
    } else if (is45Berths) {
      bedsPerRow = 3;
      leftBeds = 1;
      vipRows = 3;
    } else {
      bedsPerRow = 6;
      leftBeds = 3;
    }

    final totalRows = (berths.length / bedsPerRow).ceil();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isUpper ? Colors.blue.shade100 : Colors.green.shade100, width: 2),
        boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 8)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(isUpper ? Icons.arrow_upward : Icons.arrow_downward,
                  color: isUpper ? Colors.blue : Colors.green),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black87),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // TÀI XẾ (CHỈ Ở TẦNG 1)
          if (!isUpper)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.grey.shade500, width: 2),
                    ),
                    child: const Icon(Icons.directions_car, size: 28, color: Colors.black87),
                  ),
                  const SizedBox(width: 16),
                  const Text('Tài xế', style: TextStyle(fontWeight: FontWeight.bold)),
                  const Spacer(),
                ],
              ),
            ),

          // CÁC HÀNG GIƯỜNG
          ...List.generate(totalRows, (rowIndex) {
            final start = rowIndex * bedsPerRow;
            final rowBerths = berths.skip(start).take(bedsPerRow).toList();
            final isVipRow = is45Berths && rowIndex < vipRows;

            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // CỘT TRÁI
                  Row(
                    children: rowBerths.take(leftBeds).map((bed) {
                      return _buildBerth(context, bed, selectedSeats, isVip: isVipRow);
                    }).toList(),
                  ),
                  const SizedBox(width: 40),
                  // CỘT PHẢI
                  Row(
                    children: rowBerths.skip(leftBeds).map((bed) {
                      return _buildBerth(context, bed, selectedSeats, isVip: isVipRow);
                    }).toList(),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildBerth(BuildContext context, Seat bed, List<Seat> selectedSeats, {bool isVip = false}) {
    final isSelected = selectedSeats.contains(bed);

    void handleTap() {
      if (bed.status == 'AVAILABLE') {
        context.read<BookingCubit>().selectSeat(bed);
      }
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      child: SeatWidget(
        seat: bed,
        isSelected: isSelected,
        onTap: handleTap,
        isVip: isVip,
      ),
    );
  }

  Widget _buildSeatLayout(BuildContext blocContext, List<Seat> seats, List<Seat> selectedSeats) {
    return const Center(child: Text('Xe ghế ngồi chưa hỗ trợ', style: TextStyle(fontSize: 16)));
  }

  Widget _buildBottomBar(BookingState state) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8)],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${state.selectedSeats.length} giường', style: const TextStyle(fontSize: 14)),
                Text(
                  'Tổng: ${state.totalPrice.toInt()}đ',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: state.selectedSeats.isEmpty
                ? null
                : () => Navigator.pushNamed(context, '/payment'),
            style: ElevatedButton.styleFrom(
              backgroundColor: greenSoft,
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
            ),
            child: const Text('Tiếp theo', style: TextStyle(fontSize: 16)),
          ),
        ],
      ),
    );
  }
}