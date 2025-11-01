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
  void dispose() {
    context.read<BookingCubit>().resetSeats();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        context.read<BookingCubit>().resetSeats();
        return true;
      },
      child: Scaffold(
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
            onPressed: () {
              context.read<BookingCubit>().resetSeats();
              Navigator.pop(context);
            },
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
      ),
    );
  }

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

  Widget _buildSeatLayout(BuildContext blocContext, List<Seat> seats, List<Seat> selectedSeats) {
    final sortedSeats = List<Seat>.from(seats)..sort((a, b) => a.id.compareTo(b.id));
    final totalSeats = sortedSeats.length;
    final rows = (totalSeats / 4).ceil();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 10)],
        ),
        child: Column(
          children: [
            Row(
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
                const Text('Tài xế', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.blue.shade300),
                  ),
                  child: const Text('Cửa xe', style: TextStyle(fontSize: 12, color: Colors.blue, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 24),

            ...List.generate(rows, (rowIndex) {
              final startIndex = rowIndex * 4;
              final rowSeats = sortedSeats.skip(startIndex).take(4).toList();

              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Row(
                  children: [
                    _buildSeatWithLabel(blocContext, rowSeats.isNotEmpty ? rowSeats[0] : null, selectedSeats, _getLabel(rowSeats, 0)),
                    const SizedBox(width: 16),
                    _buildSeatWithLabel(blocContext, rowSeats.length > 1 ? rowSeats[1] : null, selectedSeats, _getLabel(rowSeats, 1)),
                    const SizedBox(width: 50),
                    _buildSeatWithLabel(blocContext, rowSeats.length > 2 ? rowSeats[2] : null, selectedSeats, _getLabel(rowSeats, 2)),
                    const SizedBox(width: 16),
                    _buildSeatWithLabel(blocContext, rowSeats.length > 3 ? rowSeats[3] : null, selectedSeats, _getLabel(rowSeats, 3)),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  String _getLabel(List<Seat> rowSeats, int index) {
    if (index < rowSeats.length) return rowSeats[index].seatNumber;
    return '';
  }

  Widget _buildSeatWithLabel(BuildContext blocContext, Seat? seat, List<Seat> selectedSeats, String label) {
    if (seat == null || label.isEmpty) {
      return const SizedBox(width: 50, height: 50);
    }

    final displaySeat = Seat(
      id: seat.id,
      seatNumber: label,
      type: seat.type,
      status: seat.status,
      price: seat.price,
      floor: seat.floor,
      roomType: seat.roomType,
    );

    return SeatWidget(
      seat: displaySeat,
      isSelected: selectedSeats.contains(seat),
      onTap: seat.status == 'AVAILABLE'
          ? () => blocContext.read<BookingCubit>().selectSeat(seat)
          : () {},
    );
  }

  Widget _buildBerthLayout(BuildContext blocContext, List<Seat> seats, List<Seat> selectedSeats) {
    if (seats.length != 34) {
      return const Center(child: Text('Chỉ hỗ trợ xe 34 giường'));
    }

    final sorted = List<Seat>.from(seats)..sort((a, b) => a.id.compareTo(b.id));

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 10)],
        ),
        child: Column(
          children: [
            const Text('Sơ đồ giường nằm', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 16),

            ...List.generate(6, (rowIndex) {
              final start = rowIndex * 5;
              final rowSeats = sorted.skip(start).take(5).toList();
              final isUpperRow = [0, 2, 3, 4].contains(rowIndex);

              return Column(
                children: [
                  if (isUpperRow)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        children: [
                          const Icon(Icons.arrow_upward, size: 16, color: Colors.blue),
                          const SizedBox(width: 4),
                          const Text('Tầng trên', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.blue)),
                          const Spacer(),
                          if (rowIndex == 0)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.blue.shade300),
                              ),
                              child: const Text('Cửa xe', style: TextStyle(fontSize: 11, color: Colors.blue, fontWeight: FontWeight.bold)),
                            ),
                        ],
                      ),
                    ),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: rowSeats.take(2).map((s) {
                          final isUpper = s.floor == 2;
                          return _buildSmallBerth(s, selectedSeats, blocContext, isUpper: isUpper);
                        }).toList(),
                      ),
                      const SizedBox(width: 60),
                      Row(
                        children: rowSeats.skip(2).map((s) {
                          final isUpper = s.floor == 2;
                          return _buildSmallBerth(s, selectedSeats, blocContext, isUpper: isUpper);
                        }).toList(),
                      ),
                    ],
                  ),

                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Row(
                      children: const [
                        Icon(Icons.arrow_downward, size: 16, color: Colors.green),
                        SizedBox(width: 4),
                        Text('Tầng dưới', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.green)),
                      ],
                    ),
                  ),

                  if (rowIndex < 5)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Divider(
                        height: 1,
                        thickness: 1,
                        color: Colors.grey.shade300,
                      ),
                    ),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallBerth(Seat seat, List<Seat> selectedSeats, BuildContext blocContext, {required bool isUpper}) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 2),
      child: SeatWidget(
        seat: seat,
        isSelected: selectedSeats.contains(seat),
        onTap: seat.status == 'AVAILABLE'
            ? () => blocContext.read<BookingCubit>().selectSeat(seat)
            : () {},
      ),
    );
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
