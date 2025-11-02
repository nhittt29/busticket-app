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
    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) context.read<BookingCubit>().resetSeats();
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
                prev.loadingSeats != curr.loadingSeats ||
                prev.selectedTrip != curr.selectedTrip,
            builder: (context, state) {
              if (state.loadingSeats) {
                return const Center(child: CircularProgressIndicator());
              }

              final ticketPrice = state.seats.isNotEmpty ? state.seats.first.price : 0.0;
              final seatCount = state.seats.length;

              final schedule = state.selectedTrip;
              final category = schedule?.category.toUpperCase();
              final seatType = schedule?.seatType.toUpperCase();

              final isBerth34 = seatCount == 34 && state.seats.any((s) => s.floor != null);
              final isBerth41 = seatCount == 41 && state.seats.any((s) => s.floor != null);
              final isSeat45 = seatCount == 45 && category == "COACH" && seatType == "SEAT";
              final isBerth45 = seatCount == 45 && !isSeat45;
              final isSeat28 = seatCount == 28;

              return Column(
                children: [
                  LegendForm(
                    ticketPrice: ticketPrice,
                    hasSelected: state.selectedSeats.isNotEmpty,
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: Center(
                      child: SizedBox(
                        height: MediaQuery.of(context).size.height * 0.55,
                        child: isBerth41
                            ? SeatLayout41Form(context, state.seats, state.selectedSeats)
                            : isBerth34
                                ? SeatLayout34Form(context, state.seats, state.selectedSeats)
                                : isSeat28
                                    ? SeatLayout28Form(context, state.seats, state.selectedSeats)
                                    : isSeat45
                                        ? SeatLayout45Form(context, state.seats, state.selectedSeats)
                                        : isBerth45
                                            ? SeatLayoutDefaultForm(context, state.seats, state.selectedSeats)
                                            : SeatLayoutDefaultForm(context, state.seats, state.selectedSeats),
                      ),
                    ),
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

  Widget LegendForm({required double ticketPrice, required bool hasSelected}) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.grey.withAlpha(25), blurRadius: 8)],
      ),
      child: Wrap(
        spacing: 16,
        runSpacing: 8,
        children: [
          _legendItem(Icons.bed, Colors.green, 'Giường trống', '${ticketPrice.toInt()}đ'),
          _legendItem(Icons.bed, Colors.red, 'Giường đã bán'),
          if (hasSelected) _legendItem(Icons.check_circle, Colors.orange, 'Đang chọn'),
          _legendItem(Icons.close, Colors.grey, 'Không bán'),
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

  // === CẬP NHẬT: Hiển thị ghế trống + Nút Xóa tất cả ===
  Widget _buildBottomBar(BookingState state) {
    final availableSeats = state.seats.where((s) => s.isAvailable).length;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(30), blurRadius: 8)],
      ),
      child: Column(
        children: [
          // HÀNG 1: Thông tin ghế + tiền
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Còn trống: $availableSeats ghế', style: const TextStyle(fontSize: 14, color: Colors.green)),
              Text('${state.selectedSeats.length} ghế đã chọn', style: const TextStyle(fontSize: 14)),
              Text(
                '${state.totalPrice.toInt()}đ',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // HÀNG 2: Nút Xóa + Tiếp theo
          Row(
            children: [
              // NÚT XÓA TẤT CẢ
              Expanded(
                child: OutlinedButton(
                  onPressed: state.selectedSeats.isEmpty
                      ? null
                      : () => context.read<BookingCubit>().clearSelection(),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                  ),
                  child: const Text('Xóa tất cả'),
                ),
              ),
              const SizedBox(width: 12),
              // NÚT TIẾP THEO
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: state.selectedSeats.isEmpty ? null : () => Navigator.pushNamed(context, '/payment'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: greenSoft,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                  ),
                  child: const Text('Tiếp theo', style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ======================
// --- Layout 41 ghế ---
class SeatLayout41Form extends StatefulWidget {
  final BuildContext blocContext;
  final List<Seat> seats;
  final List<Seat> selectedSeats;
  const SeatLayout41Form(this.blocContext, this.seats, this.selectedSeats, {super.key});

  @override
  State<SeatLayout41Form> createState() => _SeatLayout41FormState();
}

class _SeatLayout41FormState extends State<SeatLayout41Form> {
  double _seatScale = 0.85;

  @override
  Widget build(BuildContext context) {
    final lowerSeats = widget.seats.where((s) => s.floor == 1).toList();
    final upperSeats = widget.seats.where((s) => s.floor == 2).toList();
    final mainUpperSeats = upperSeats.take(18).toList();
    final lastRowUpperSeats = upperSeats.skip(18).take(2).toList();
    final movedSeats = lowerSeats.skip(6 * 3).take(3).toList();
    lowerSeats.removeWhere((s) => movedSeats.contains(s));
    lastRowUpperSeats.addAll(movedSeats);

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
            child: Transform.scale(
              scale: _seatScale,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [BoxShadow(color: Colors.grey.withAlpha(25), blurRadius: 10)],
                ),
                child: Column(
                  children: [
                    const Text('Sơ đồ giường nằm', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                    const SizedBox(height: 10),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.person, size: 32, color: Colors.black),
                          SizedBox(width: 6),
                          Text("Tài xế", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFloor("Tầng dưới", Colors.green, lowerSeats, 3),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            _buildFloor("Tầng trên", Colors.blue, mainUpperSeats, 3),
                            if (lastRowUpperSeats.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 12),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: lastRowUpperSeats.map((seat) {
                                    return SeatWidget(
                                      seat: seat,
                                      isSelected: widget.selectedSeats.contains(seat),
                                      onTap: seat.status == 'AVAILABLE'
                                          ? () => widget.blocContext.read<BookingCubit>().selectSeat(seat)
                                          : () {},
                                    );
                                  }).toList(),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline, color: Colors.grey),
                onPressed: () => setState(() {
                  _seatScale = (_seatScale - 0.1).clamp(0.6, 1.4);
                }),
              ),
              Text('${(_seatScale * 100).toInt()}%', style: const TextStyle(fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, color: Colors.grey),
                onPressed: () => setState(() {
                  _seatScale = (_seatScale + 0.1).clamp(0.6, 1.4);
                }),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFloor(String title, Color color, List<Seat> seats, int columnCount) {
    List<List<Seat>> columns = List.generate(columnCount, (_) => []);
    for (int i = 0; i < seats.length; i++) {
      columns[i % columnCount].add(seats[i]);
    }
    List<double> columnSpacing = List.filled(columnCount - 1, 16);
    if (columnCount >= 3) {
      columnSpacing[0] = 6;
      columnSpacing[columnCount - 2] = 6;
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.bed, color: color, size: 17),
            const SizedBox(width: 4),
            Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: color)),
          ],
        ),
        const SizedBox(height: 6),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(width: 12),
            for (int i = 0; i < columns.length; i++) ...[
              Column(
                children: columns[i].map((seat) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: SeatWidget(
                      seat: seat,
                      isSelected: widget.selectedSeats.contains(seat),
                      onTap: seat.status == 'AVAILABLE'
                          ? () => widget.blocContext.read<BookingCubit>().selectSeat(seat)
                          : () {},
                    ),
                  );
                }).toList(),
              ),
              if (i < columns.length - 1) SizedBox(width: columnSpacing[i]),
            ],
            const SizedBox(width: 12),
          ],
        ),
      ],
    );
  }
}

// ======================
// --- Layout 34 ghế ---
class SeatLayout34Form extends StatefulWidget {
  final BuildContext blocContext;
  final List<Seat> seats;
  final List<Seat> selectedSeats;
  const SeatLayout34Form(this.blocContext, this.seats, this.selectedSeats, {super.key});

  @override
  State<SeatLayout34Form> createState() => _SeatLayout34FormState();
}

class _SeatLayout34FormState extends State<SeatLayout34Form> {
  double _seatScale = 0.85;

  @override
  Widget build(BuildContext context) {
    final lowerSeats = widget.seats.where((s) => s.floor == 1).toList();
    final upperSeats = widget.seats.where((s) => s.floor == 2).toList();

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
            child: Transform.scale(
              scale: _seatScale,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [BoxShadow(color: Colors.grey.withAlpha(25), blurRadius: 10)],
                ),
                child: Column(
                  children: [
                    const Text('Sơ đồ giường nằm', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                    const SizedBox(height: 10),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.person, size: 32, color: Colors.black),
                          SizedBox(width: 6),
                          Text("Tài xế", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFloorSide("Tầng dưới", Colors.green, lowerSeats),
                        _buildFloorSide("Tầng trên", Colors.blue, upperSeats),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline, color: Colors.grey),
                onPressed: () => setState(() {
                  _seatScale = (_seatScale - 0.1).clamp(0.6, 1.4);
                }),
              ),
              Text('${(_seatScale * 100).toInt()}%', style: const TextStyle(fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, color: Colors.grey),
                onPressed: () => setState(() {
                  _seatScale = (_seatScale + 0.1).clamp(0.6, 1.4);
                }),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFloorSide(String title, Color color, List<Seat> floorSeats) {
    final List<int> config = [6, 5, 6, 5, 6, 6];
    int index = 0;
    List<List<Seat>> cols = [];
    for (int count in config) {
      cols.add(floorSeats.skip(index).take(count).toList());
      index += count;
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.bed, color: color, size: 17),
            const SizedBox(width: 4),
            Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: color)),
          ],
        ),
        const SizedBox(height: 6),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (int i = 0; i < cols.length; i++) ...[
              Column(
                children: cols[i].map((seat) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: SeatWidget(
                      seat: seat,
                      isSelected: widget.selectedSeats.contains(seat),
                      onTap: seat.status == 'AVAILABLE'
                          ? () => widget.blocContext.read<BookingCubit>().selectSeat(seat)
                          : () {},
                    ),
                  );
                }).toList(),
              ),
              if (i < cols.length - 1) const SizedBox(width: 10),
            ],
          ],
        ),
      ],
    );
  }
}

// ======================
// --- Layout 28 ghế – SIZE GHẾ ĐỒNG NHẤT 100% VỚI SƠ ĐỒ 45 ---
class SeatLayout28Form extends StatefulWidget {
  final BuildContext blocContext;
  final List<Seat> seats;
  final List<Seat> selectedSeats;
  const SeatLayout28Form(this.blocContext, this.seats, this.selectedSeats, {super.key});

  @override
  State<SeatLayout28Form> createState() => _SeatLayout28FormState();
}

class _SeatLayout28FormState extends State<SeatLayout28Form> {
  double _seatScale = 0.85;

  @override
  Widget build(BuildContext context) {
    final sortedSeats = List<Seat>.from(widget.seats)..sort((a, b) => a.id.compareTo(b.id));

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Transform.scale(
              scale: _seatScale,
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.grey.withAlpha(25), blurRadius: 10)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Text(
                      'Sơ đồ ghế ngồi',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                    ),
                    const SizedBox(height: 10),

                    // ICON TÀI XẾ
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(left: 35, top: 12),
                          child: Row(
                            children: const [
                              Icon(Icons.person, size: 32),
                              SizedBox(width: 8),
                              Text("Tài xế", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                        const Spacer(),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // === 6 HÀNG ĐẦU (1–6): 2-2 CỘT TRÁI/PHẢI ===
                    for (int row = 0; row < 6; row++)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // CỘT TRÁI: 2 ghế
                            Padding(
                              padding: const EdgeInsets.only(left: 35),
                              child: Row(
                                children: [
                                  for (int i = 0; i < 2; i++)
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6),
                                      child: SeatWidget(
                                        seat: sortedSeats[row * 4 + i],
                                        isSelected: widget.selectedSeats.contains(sortedSeats[row * 4 + i]),
                                        onTap: sortedSeats[row * 4 + i].status == 'AVAILABLE'
                                            ? () => widget.blocContext.read<BookingCubit>().selectSeat(sortedSeats[row * 4 + i])
                                            : () {},
                                      ),
                                    ),
                                ],
                              ),
                            ),

                            const SizedBox(width: 70), // LỐI ĐI

                            // CỘT PHẢI: 2 ghế
                            Padding(
                              padding: const EdgeInsets.only(right: 35),
                              child: Row(
                                children: [
                                  for (int i = 2; i < 4; i++)
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6),
                                      child: SeatWidget(
                                        seat: sortedSeats[row * 4 + i],
                                        isSelected: widget.selectedSeats.contains(sortedSeats[row * 4 + i]),
                                        onTap: sortedSeats[row * 4 + i].status == 'AVAILABLE'
                                            ? () => widget.blocContext.read<BookingCubit>().selectSeat(sortedSeats[row * 4 + i])
                                            : () {},
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                    // === HÀNG CUỐI: 5 GHẾ – ĐỒNG SIZE VỚI 45 ===
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: sortedSeats.skip(24).take(5).map((seat) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 6),
                            child: SeatWidget(
                              seat: seat,
                              isSelected: widget.selectedSeats.contains(seat),
                              onTap: seat.status == 'AVAILABLE'
                                  ? () => widget.blocContext.read<BookingCubit>().selectSeat(seat)
                                  : () {},
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // NÚT ZOOM
        Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline, color: Colors.grey),
                onPressed: () => setState(() {
                  _seatScale = (_seatScale - 0.1).clamp(0.6, 1.4);
                }),
              ),
              Text('${(_seatScale * 100).toInt()}%', style: const TextStyle(fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, color: Colors.grey),
                onPressed: () => setState(() {
                  _seatScale = (_seatScale + 0.1).clamp(0.6, 1.4);
                }),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ======================
// --- Layout 45 ghế – SIZE GHẾ CHUẨN (ĐÃ ĐỒNG BỘ VỚI 28) ---
class SeatLayout45Form extends StatefulWidget {
  final BuildContext blocContext;
  final List<Seat> seats;
  final List<Seat> selectedSeats;
  const SeatLayout45Form(this.blocContext, this.seats, this.selectedSeats, {super.key});

  @override
  State<SeatLayout45Form> createState() => _SeatLayout45FormState();
}

class _SeatLayout45FormState extends State<SeatLayout45Form> {
  double _seatScale = 0.85;

  @override
  Widget build(BuildContext context) {
    final sortedSeats = List<Seat>.from(widget.seats)..sort((a, b) => a.id.compareTo(b.id));

    final first24Seats = sortedSeats.take(24).toList();
    final next16Seats = sortedSeats.skip(24).take(16).toList();
    final last5Seats = sortedSeats.skip(40).take(5).toList();

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Transform.scale(
              scale: _seatScale,
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.grey.withAlpha(25), blurRadius: 10)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Text(
                      'Sơ đồ ghế ngồi',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                    ),
                    const SizedBox(height: 10),

                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(left: 35, top: 12),
                          child: Row(
                            children: const [
                              Icon(Icons.person, size: 32),
                              SizedBox(width: 8),
                              Text("Tài xế", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                        const Spacer(),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // 6 HÀNG ĐẦU
                    for (int row = 0; row < 6; row++)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(left: 35),
                              child: Row(
                                children: [
                                  for (int i = 0; i < 2; i++)
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6),
                                      child: SeatWidget(
                                        seat: first24Seats[row * 4 + i],
                                        isSelected: widget.selectedSeats.contains(first24Seats[row * 4 + i]),
                                        onTap: first24Seats[row * 4 + i].status == 'AVAILABLE'
                                            ? () => widget.blocContext.read<BookingCubit>().selectSeat(first24Seats[row * 4 + i])
                                            : () {},
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 70),
                            Padding(
                              padding: const EdgeInsets.only(right: 35),
                              child: Row(
                                children: [
                                  for (int i = 2; i < 4; i++)
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6),
                                      child: SeatWidget(
                                        seat: first24Seats[row * 4 + i],
                                        isSelected: widget.selectedSeats.contains(first24Seats[row * 4 + i]),
                                        onTap: first24Seats[row * 4 + i].status == 'AVAILABLE'
                                            ? () => widget.blocContext.read<BookingCubit>().selectSeat(first24Seats[row * 4 + i])
                                            : () {},
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                    // HÀNG 7–10
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(left: 35),
                          child: Column(
                            children: List.generate(4, (row) {
                              final seat1 = next16Seats[row * 4];
                              final seat2 = next16Seats[row * 4 + 1];
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                child: Row(
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6),
                                      child: SeatWidget(
                                        seat: seat1,
                                        isSelected: widget.selectedSeats.contains(seat1),
                                        onTap: seat1.status == 'AVAILABLE'
                                            ? () => widget.blocContext.read<BookingCubit>().selectSeat(seat1)
                                            : () {},
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6),
                                      child: SeatWidget(
                                        seat: seat2,
                                        isSelected: widget.selectedSeats.contains(seat2),
                                        onTap: seat2.status == 'AVAILABLE'
                                            ? () => widget.blocContext.read<BookingCubit>().selectSeat(seat2)
                                            : () {},
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ),
                        ),
                        const SizedBox(width: 70),
                        Padding(
                          padding: const EdgeInsets.only(right: 35),
                          child: Column(
                            children: List.generate(4, (row) {
                              final seat1 = next16Seats[row * 4 + 2];
                              final seat2 = next16Seats[row * 4 + 3];
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                child: Row(
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6),
                                      child: SeatWidget(
                                        seat: seat1,
                                        isSelected: widget.selectedSeats.contains(seat1),
                                        onTap: seat1.status == 'AVAILABLE'
                                            ? () => widget.blocContext.read<BookingCubit>().selectSeat(seat1)
                                            : () {},
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 6),
                                      child: SeatWidget(
                                        seat: seat2,
                                        isSelected: widget.selectedSeats.contains(seat2),
                                        onTap: seat2.status == 'AVAILABLE'
                                            ? () => widget.blocContext.read<BookingCubit>().selectSeat(seat2)
                                            : () {},
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ),
                        ),
                      ],
                    ),

                    // HÀNG 11
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: last5Seats.map((seat) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 6),
                            child: SeatWidget(
                              seat: seat,
                              isSelected: widget.selectedSeats.contains(seat),
                              onTap: seat.status == 'AVAILABLE'
                                  ? () => widget.blocContext.read<BookingCubit>().selectSeat(seat)
                                  : () {},
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_outline, color: Colors.grey),
                onPressed: () => setState(() {
                  _seatScale = (_seatScale - 0.1).clamp(0.6, 1.4);
                }),
              ),
              Text('${(_seatScale * 100).toInt()}%', style: const TextStyle(fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.add_circle_outline, color: Colors.grey),
                onPressed: () => setState(() {
                  _seatScale = (_seatScale + 0.1).clamp(0.6, 1.4);
                }),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ======================
// --- Layout mặc định ---
class SeatLayoutDefaultForm extends StatelessWidget {
  final BuildContext blocContext;
  final List<Seat> seats;
  final List<Seat> selectedSeats;
  const SeatLayoutDefaultForm(this.blocContext, this.seats, this.selectedSeats, {super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text("Layout thường"));
  }
}