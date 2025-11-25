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
    _loadDropoffPoints();
  }

  Future<void> _loadDropoffPoints() async {
    if (!mounted) return;
    setState(() => _isLoadingPoints = true);

    try {
      final scheduleId = context.read<BookingCubit>().state.selectedTrip?.id;
      if (scheduleId == null) {
        if (mounted) {
          _showSnackBar('Không tìm thấy chuyến xe', isError: true);
        }
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

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message, style: const TextStyle(fontWeight: FontWeight.w600)),
          backgroundColor: isError ? Colors.redAccent : successGreen,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 3),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<BookingCubit, BookingState>(
      builder: (context, state) {
        final selectedSeatsCount = state.selectedSeats.length;
        final baseTotal = state.totalPrice;
        final surchargePerPerson = state.surcharge;
        final totalSurcharge = surchargePerPerson * selectedSeatsCount;
        final finalTotal = state.finalTotalPrice;

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
              'Chọn điểm trả khách',
              style: TextStyle(
                color: Colors.white,
                fontSize: 23,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ),
          body: Column(
            children: [
              // CARD TỔNG TIỀN – ĐẸP & HIỆN ĐẠI
              Container(
                margin: const EdgeInsets.all(20),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: pastelBlue.withOpacity(0.6), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Số ghế đã chọn', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        Text('$selectedSeatsCount ghế', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: deepBlue)),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Tiền vé gốc', style: TextStyle(fontSize: 15)),
                        Text(
                          '${baseTotal.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    if (totalSurcharge > 0) ...[
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Phụ thu trả khách', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.w600)),
                          Text(
                            '+${totalSurcharge.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange, fontSize: 17),
                          ),
                        ],
                      ),
                    ],
                    const Divider(height: 32, thickness: 1.2),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Tổng thanh toán', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        Text(
                          '${finalTotal.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                          style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: successGreen),
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
                  child: Text(
                    'Chọn điểm trả khách',
                    style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700, color: Colors.black87),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              Expanded(
                child: _isLoadingPoints
                    ? const Center(child: CircularProgressIndicator(color: primaryBlue))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: _dropoffPoints.length + 1,
                        itemBuilder: (context, index) {
                          if (index < _dropoffPoints.length) {
                            final point = _dropoffPoints[index];
                            final isSelected = state.selectedDropoffPoint?.id == point.id;

                            return Container(
                              margin: const EdgeInsets.only(bottom: 14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: isSelected ? primaryBlue : Colors.transparent, width: 2),
                                boxShadow: [
                                  BoxShadow(color: Colors.grey.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4)),
                                ],
                              ),
                              child: RadioListTile<DropoffPoint>(
                                value: point,
                                groupValue: state.selectedDropoffPoint,
                                activeColor: primaryBlue,
                                selected: isSelected,
                                title: Text(point.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                                subtitle: Text(point.address, style: const TextStyle(color: Colors.black54)),
                                secondary: Text(
                                  point.surcharge == 0 ? 'Miễn phí' : '+${point.surcharge.toInt()}k',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: point.surcharge == 0 ? successGreen : Colors.orange,
                                    fontSize: 15,
                                  ),
                                ),
                                controlAffinity: ListTileControlAffinity.leading,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                tileColor: isSelected ? primaryBlue.withOpacity(0.08) : null,
                                onChanged: (value) => context.read<BookingCubit>().selectDropoffPoint(point),
                              ),
                            );
                          }

                          // PHẦN TRẢ TẬN NƠI – ĐẸP & NỔI BẬT
                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [Color(0xFFE1BEE7), Color(0xFFF3E5F5)]),
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [BoxShadow(color: Colors.purple.withOpacity(0.2), blurRadius: 12, offset: const Offset(0, 6))],
                            ),
                            child: ExpansionTile(
                              leading: const Icon(Icons.home_filled, color: Colors.purple, size: 28),
                              title: const Text('Trả tận nơi (+150.000đ/người)', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.purple, fontSize: 16)),
                              childrenPadding: const EdgeInsets.all(20),
                              expandedCrossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                TextField(
                                  controller: _addressController,
                                  maxLines: 3,
                                  decoration: InputDecoration(
                                    hintText: 'Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện...)',
                                    filled: true,
                                    fillColor: Colors.white,
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Colors.purple, width: 2)),
                                  ),
                                ),
                                const SizedBox(height: 20),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: _addressController.text.trim().isEmpty
                                        ? null
                                        : () {
                                            context.read<BookingCubit>().selectDropoffAddress(_addressController.text.trim());
                                            _showSnackBar('Đã chọn trả tận nơi');
                                          },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.purple,
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                      elevation: 6,
                                    ),
                                    child: const Text('Xác nhận trả tận nơi', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),

              // NÚT THANH TOÁN – ĐỈNH CAO
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 16, offset: const Offset(0, -6))],
                ),
                child: SizedBox(
                  height: 64,
                  child: ElevatedButton.icon(
                    onPressed: finalTotal > 0 ? () => Navigator.pushNamed(context, '/payment') : null,
                    icon: const Icon(Icons.payment, size: 30),
                    label: const Text('Tiếp tục thanh toán', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryBlue,
                      disabledBackgroundColor: Colors.grey[400],
                      foregroundColor: Colors.white,
                      elevation: 10,
                      shadowColor: primaryBlue.withOpacity(0.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
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