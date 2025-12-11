// lib/booking/screens/dropoff_selection_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';
import '../models/dropoff_point.dart';
import '../services/booking_api_service.dart';

const Color primaryBlue = Color(0xFF6AB7F5);
const Color accentBlue = Color(0xFF4A9EFF);
const Color deepBlue = Color(0xFF1976D2);
const Color pastelBlue = Color(0xFFA0D8F1);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color successGreen = Color(0xFF4CAF50);

class DropoffSelectionScreen extends StatefulWidget {
  const DropoffSelectionScreen({super.key});

  @override
  State<DropoffSelectionScreen> createState() => _DropoffSelectionScreenState();
}

class _DropoffSelectionScreenState extends State<DropoffSelectionScreen> {
  final TextEditingController _addressController = TextEditingController();
  bool _isLoadingPoints = true;
  List<DropoffPoint> _dropoffPoints = [];

  @override
  void initState() {
    super.initState();

    // Listener để bật tắt nút "Xác nhận" theo chữ nhập vào
    _addressController.addListener(() {
      if (mounted) setState(() {});
    });

    _loadDropoffPoints();
  }

  Future<void> _loadDropoffPoints() async {
    if (!mounted) return;
    setState(() => _isLoadingPoints = true);

    try {
      final scheduleId = context.read<BookingCubit>().state.selectedTrip?.id;
      if (scheduleId == null) {
        if (mounted) _showSnackBar('Không tìm thấy chuyến xe', isError: true);
        return;
      }

      final points = await BookingApiService.getDropoffPoints(scheduleId);

      if (points.isEmpty || !points.any((p) => p.isDefault)) {
        points.insert(0, const DropoffPoint(id: 0, name: "Bến xe chính", address: "Bến xe đích", surcharge: 0.0));
      }

      if (mounted) {
        setState(() {
          _dropoffPoints = points;
          _isLoadingPoints = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingPoints = false);
        _showSnackBar('Không tải được điểm trả khách', isError: true);
      }
    }
  }

  // ✅ ĐÃ SỬA: SnackBar giống 100% style nút "Tiếp tục thanh toán"
  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 16,
              color: Colors.white,
            ),
          ),
          backgroundColor: isError ? Colors.redAccent : primaryBlue,
          behavior: SnackBarBehavior.floating,
          elevation: 10,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(31), // 💯 như nút thanh toán
          ),
          margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          duration: const Duration(seconds: 2),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<BookingCubit, BookingState>(
      builder: (context, state) {
        final selectedSeatsCount = state.selectedSeats.length;
        final baseTotal = state.totalPrice;
        final surcharge = state.surcharge * selectedSeatsCount;
        final dropoffDiscount = state.dropoffDiscount * selectedSeatsCount; // Mới
        final finalTotal = state.finalTotalPrice;

        final doorToDoorPoint = DropoffPoint(
          id: -1,
          name: "Trả tận nơi",
          address: _addressController.text.trim().isEmpty ? "Nhập địa chỉ..." : _addressController.text.trim(),
          surcharge: 150000,
        );

        final isDoorToDoorSelected = state.selectedDropoffPoint?.id == -1;

        return Scaffold(
          backgroundColor: backgroundLight,
          appBar: AppBar(
            flexibleSpace: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [primaryBlue, accentBlue], begin: Alignment.topLeft, end: Alignment.bottomRight),
              ),
            ),
            elevation: 0,
            centerTitle: true,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            title: const Text(
              'Chọn điểm trả khách',
              style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: 0.4),
            ),
          ),
          body: Column(
            children: [
              Container(
                margin: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: pastelBlue.withAlpha(153), width: 1.4),
                  boxShadow: [BoxShadow(color: Colors.grey.withAlpha(77), blurRadius: 16, offset: const Offset(0, 8))],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Số ghế', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        Text('$selectedSeatsCount ghế', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: deepBlue)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Tiền vé', style: TextStyle(fontSize: 15)),
                        Text('${baseTotal.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ'),
                      ],
                    ),
                    if (surcharge > 0) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              'Phụ thu (${state.selectedDropoffPoint?.name ?? ''})',
                              style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.w600),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '+${surcharge.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange),
                          ),
                        ],
                      ),
                    ],
                    if (dropoffDiscount > 0) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Ưu đãi chặng ngắn', style: TextStyle(color: successGreen, fontWeight: FontWeight.w600)),
                          Text(
                            '-${dropoffDiscount.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: successGreen),
                          ),
                        ],
                      ),
                    ],
                    const Divider(height: 28),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Tổng thanh toán', style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold)),
                        Text(
                          '${finalTotal.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                          style: TextStyle(fontSize: 27, fontWeight: FontWeight.bold, color: successGreen),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 24),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text('Điểm trả khách', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                ),
              ),
              const SizedBox(height: 12),

              Expanded(
                child: _isLoadingPoints
                    ? const Center(child: CircularProgressIndicator(color: primaryBlue))
                    : ListView(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        children: [
                          ..._dropoffPoints.map((point) {
                            final isSelected = state.selectedDropoffPoint?.id == point.id;
                            
                            // LOGIC VIEW-ONLY: Kiểm tra xem điểm trả này có được giảm giá không?
                            // Logic này phải khớp với BookingCubit
                            bool isEligibleForDiscount = false;
                            double potentialDiscount = 0;
                            final trip = context.read<BookingCubit>().state.selectedTrip;
                            
                            if (trip != null && point.priceDifference != 0) {
                               final diffHours = DateTime.parse(trip.departure).toLocal().difference(DateTime.now()).inHours;
                               if (diffHours < 24 && trip.totalSeats > 0) {
                                  final occupancy = (trip.totalSeats - trip.availableSeats) / trip.totalSeats;
                                  if (occupancy < 0.8) {
                                     isEligibleForDiscount = true;
                                     potentialDiscount = point.priceDifference.abs();
                                  }
                               }
                            }

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: isSelected ? primaryBlue : Colors.transparent, width: 2),
                                boxShadow: [BoxShadow(color: Colors.grey.withAlpha(51), blurRadius: 10, offset: const Offset(0, 4))],
                              ),
                              child: RadioListTile<DropoffPoint>(
                                value: point,
                                groupValue: state.selectedDropoffPoint,
                                activeColor: primaryBlue,
                                selected: isSelected,
                                title: Text(point.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(point.address, style: const TextStyle(fontSize: 14)),
                                    if (isEligibleForDiscount) 
                                      Padding(
                                        padding: const EdgeInsets.only(top: 4),
                                        child: Text(
                                          'Ưu đãi chặng ngắn: -${potentialDiscount.toInt()}đ',
                                          style: const TextStyle(color: successGreen, fontWeight: FontWeight.bold, fontSize: 13),
                                        ),
                                      ),
                                  ],
                                ),
                                secondary: Text(
                                  point.surcharge == 0 ? 'Miễn phí' : '+${point.surcharge.toInt()}k',
                                  style: TextStyle(fontWeight: FontWeight.bold, color: point.surcharge == 0 ? successGreen : Colors.orange),
                                ),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                                tileColor: isSelected ? primaryBlue.withAlpha(25) : null,
                                onChanged: (_) => context.read<BookingCubit>().selectDropoffPoint(point),
                              ),
                            );
                          }),

                          Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: isDoorToDoorSelected ? deepBlue : Colors.transparent, width: 2),
                              boxShadow: [BoxShadow(color: deepBlue.withAlpha(51), blurRadius: 10, offset: const Offset(0, 4))],
                            ),
                            child: RadioListTile<DropoffPoint>(
                              value: doorToDoorPoint,
                              groupValue: state.selectedDropoffPoint,
                              activeColor: deepBlue,
                              selected: isDoorToDoorSelected,
                              title: const Text("Trả tận nơi", style: TextStyle(fontWeight: FontWeight.bold, color: deepBlue, fontSize: 16)),
                              subtitle: const Text("Phụ thu 150.000đ/người"),
                              secondary: const Text("+150k", style: TextStyle(fontWeight: FontWeight.bold, color: deepBlue)),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                              tileColor: isDoorToDoorSelected ? deepBlue.withAlpha(25) : null,
                              onChanged: (_) {
                                context.read<BookingCubit>().selectDropoffPoint(doorToDoorPoint);
                              },
                            ),
                          ),

                          if (isDoorToDoorSelected)
                            Container(
                              margin: const EdgeInsets.only(bottom: 20),
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: deepBlue.withAlpha(102), width: 1.5),
                                boxShadow: [BoxShadow(color: deepBlue.withAlpha(51), blurRadius: 12, offset: const Offset(0, 6))],
                              ),
                              child: Column(
                                children: [
                                  TextField(
                                    controller: _addressController,
                                    maxLines: 3,
                                    decoration: InputDecoration(
                                      hintText: 'Số nhà, đường, phường/xã, quận/huyện...',
                                      filled: true,
                                      fillColor: deepBlue.withAlpha(25),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(16),
                                        borderSide: const BorderSide(color: deepBlue, width: 2),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton(
                                      onPressed: _addressController.text.trim().isEmpty
                                          ? null
                                          : () {
                                              context.read<BookingCubit>().selectDropoffAddress(_addressController.text.trim());
                                              _showSnackBar("Đã lưu địa chỉ trả tận nơi");
                                            },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: deepBlue,
                                        padding: const EdgeInsets.symmetric(vertical: 16),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                        elevation: 6,
                                      ),
                                      child: const Text('Xác nhận địa chỉ', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
              ),

              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withAlpha(51), blurRadius: 16, offset: const Offset(0, -6))]),
                child: SizedBox(
                  height: 62,
                  child: ElevatedButton.icon(
                    onPressed: finalTotal > 0 ? () => Navigator.pushNamed(context, '/payment') : null,
                    icon: const Icon(Icons.payment_rounded, size: 28),
                    label: const Text('Tiếp tục thanh toán', style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryBlue,
                      disabledBackgroundColor: Colors.grey[400],
                      foregroundColor: Colors.white,
                      elevation: 10,
                      shadowColor: primaryBlue.withAlpha(128),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(31)),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }
}
