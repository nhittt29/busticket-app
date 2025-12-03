// lib/ticket/screens/ticket_detail_screen.dart
import 'package:flutter/material.dart';
import '../services/ticket_api_service.dart';
import 'ticket_qr_screen.dart';
import 'group_ticket_qr_screen.dart';

class TicketDetailScreen extends StatefulWidget {
  final int ticketId;
  const TicketDetailScreen({super.key, required this.ticketId});

  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen>
    with TickerProviderStateMixin {
  late Future<Map<String, dynamic>> _ticketFuture;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _ticketFuture = TicketApiService.getTicketDetail(widget.ticketId);
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _ticketFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: Color(0xFFEAF6FF),
            body: Center(
              child: CircularProgressIndicator(
                color: Color(0xFF6AB7F5),
                strokeWidth: 4,
              ),
            ),
          );
        }

        if (!snapshot.hasData || snapshot.data == null) {
          return Scaffold(
            backgroundColor: const Color(0xFFEAF6FF),
            appBar: AppBar(
              flexibleSpace: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF6AB7F5), Color(0xFF4A9EFF)],
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
                'Chi tiết vé',
                style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
              ),
            ),
            body: const Center(
              child: Text(
                'Không tìm thấy thông tin vé',
                style: TextStyle(fontSize: 17, color: Colors.black54, fontWeight: FontWeight.w500),
              ),
            ),
          );
        }

        final ticket = snapshot.data!;
        final paymentHistoryId = ticket['paymentHistoryId'] as int?;

        // VÉ NHÓM → CHUYỂN LUÔN SANG MÀN HÌNH NHÓM
        if (paymentHistoryId != null && paymentHistoryId > 0) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                  builder: (_) => GroupTicketQRScreen(paymentHistoryId: paymentHistoryId),
                ),
              );
            }
          });
          return const Scaffold(
            backgroundColor: Color(0xFFEAF6FF),
            body: Center(
              child: CircularProgressIndicator(color: Color(0xFF6AB7F5)),
            ),
          );
        }

        // VÉ LẺ BÌNH THƯỜNG
        final status = ticket['status'] as String? ?? '';
        final isPaid = status == 'PAID' || status == 'Đã thanh toán';
        final qrCode = ticket['paymentHistory']?['qrCode']?.toString();

        return Scaffold(
          backgroundColor: const Color(0xFFEAF6FF),
          appBar: AppBar(
            flexibleSpace: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF6AB7F5), Color(0xFF4A9EFF)],
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
            title: Text(
              'Vé #${ticket['id']}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 21,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
            bottom: TabBar(
              controller: _tabController,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              indicatorColor: Colors.white,
              indicatorWeight: 4,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              tabs: const [
                Tab(text: 'Thông tin vé'),
                Tab(text: 'Thanh toán'),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tabController,
            children: [
              _buildInfoTab(ticket, isPaid, qrCode),
              _buildPaymentTab(ticket),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInfoTab(Map<String, dynamic> ticket, bool isPaid, String? qrCode) {
    final route = ticket['schedule']?['route'] as Map<String, dynamic>?;
    final startPoint = route?['startPoint']?.toString() ?? '—';
    final endPoint = route?['endPoint']?.toString() ?? '—';
    final departureAt = ticket['schedule']?['departureAt']?.toString() ?? '';
    final seatNumber = ticket['seat']?['seatNumber']?.toString() ??
        ticket['seat']?['code']?.toString() ??
        '—';

    final price = (ticket['totalPrice'] as num?)?.toDouble() ??
        (ticket['price'] as num?)?.toDouble() ??
        0.0;
    final formattedPrice = price.toInt().toString().replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');

    // ĐIỂM TRẢ KHÁCH – HIỂN THỊ RÕ ĐỊA CHỈ + PHỤ THU ĐỎ CHÓT (giống GroupTicket)
    final dropoffInfo = ticket['dropoffInfo'] as Map<String, dynamic>?;
    final dropoffAddress = ticket['dropoffAddress']?.toString();

    String dropoffTitle = 'Bến xe đích';
    String dropoffAddressLine = '';
    String surchargeText = 'Miễn phí';
    bool hasSurcharge = false;

    if (dropoffInfo != null) {
      dropoffTitle = dropoffInfo['display']?.toString() ?? 'Trả tận nơi';
      dropoffAddressLine = dropoffInfo['address']?.toString() ?? dropoffAddress ?? '';
      surchargeText = dropoffInfo['surchargeText']?.toString() ?? 'Miễn phí';
      hasSurcharge = surchargeText != 'Miễn phí' && surchargeText.isNotEmpty;
    } else if (dropoffAddress != null && dropoffAddress.isNotEmpty) {
      dropoffTitle = 'Trả tận nơi';
      dropoffAddressLine = dropoffAddress;
      hasSurcharge = true;
    }

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 40),
      child: Column(
        children: [
          // Nút Xem QR
          if (isPaid && qrCode != null && qrCode.isNotEmpty)
            Container(
              width: double.infinity,
              height: 56,
              margin: const EdgeInsets.only(bottom: 20),
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => TicketQRScreen(qrUrl: qrCode, ticket: ticket),
                    ),
                  );
                },
                icon: const Icon(Icons.qr_code_scanner, size: 26),
                label: const Text('Xem mã QR lên xe',
                    style: TextStyle(fontSize: 16.8, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50),
                  foregroundColor: Colors.white,
                  elevation: 8,
                  shadowColor: const Color(0xFF4CAF50).withAlpha(100),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                ),
              ),
            ),

          // CARD CHÍNH
          Container(
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(26),
              border: Border.all(color: const Color(0xFFA0D8F1).withAlpha(180), width: 1.5),
              boxShadow: [
                BoxShadow(color: Colors.grey.withOpacity(0.25), blurRadius: 16, offset: const Offset(0, 8)),
              ],
            ),
            child: Column(
              children: [
                _infoRow('Tuyến xe', '$startPoint → $endPoint', icon: Icons.directions_bus_filled),
                _infoRow('Giờ khởi hành', _formatDateTime(departureAt), icon: Icons.access_time_filled),
                _infoRow('Số ghế', seatNumber, icon: Icons.event_seat, valueSize: 17),

                // ĐIỂM TRẢ KHÁCH – ĐẸP, RÕ RÀNG NHƯ GROUP TICKET
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.location_on, size: 28, color: Color(0xFFFF5252)),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              dropoffTitle,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1B5E20),
                              ),
                            ),
                            if (dropoffAddressLine.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Text(
                                dropoffAddressLine,
                                style: const TextStyle(
                                  fontSize: 15.5,
                                  color: Colors.black87,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      if (hasSurcharge)
                        Text(
                          surchargeText,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFD32F2F),
                          ),
                        ),
                    ],
                  ),
                ),

                const Divider(height: 32, thickness: 1.2, color: Color(0xFFE3F2FD)),

                _infoRow('Tổng tiền', '$formattedPriceđ',
                    icon: Icons.paid, valueColor: const Color(0xFF1976D2), valueSize: 23, fontWeight: FontWeight.bold),
                _infoRow(
                  'Trạng thái',
                  _statusText(ticket['status']),
                  icon: _statusIcon(ticket['status']),
                  valueColor: _statusColor(ticket['status']),
                  valueSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentTab(Map<String, dynamic> ticket) {
    final payment = ticket['paymentHistory'] as Map<String, dynamic>?;

    if (payment == null) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.info_outline, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('Chưa có thông tin thanh toán', style: TextStyle(fontSize: 16, color: Colors.black54)),
          ],
        ),
      );
    }

    final amount = (payment['amount'] as num?)?.toInt() ?? 0;
    final formattedAmount = amount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');

    final discountAmount = (payment['discountAmount'] as num?)?.toInt() ?? 0;
    final formattedDiscount = discountAmount.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 40),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(26),
          border: Border.all(color: const Color(0xFFA0D8F1).withAlpha(180), width: 1.5),
          boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.25), blurRadius: 16, offset: const Offset(0, 8))],
        ),
        child: Column(
          children: [
            _infoRow('Mã thanh toán', 'V${(payment['id'] as int?)?.toString().padLeft(6, '0') ?? '000000'}', icon: Icons.confirmation_number),
            _infoRow('Phương thức', payment['method']?.toString() ?? '—', icon: Icons.payment),
            _infoRow('Số tiền', '$formattedAmountđ', icon: Icons.attach_money, valueColor: const Color(0xFF1976D2), valueSize: 20),
            if (discountAmount > 0)
              _infoRow('Giảm giá', '-$formattedDiscountđ',
                  icon: Icons.discount, valueColor: Colors.red, valueSize: 18),
            _infoRow('Thời gian', _formatDateTime(payment['paidAt']?.toString()), icon: Icons.schedule, valueColor: const Color(0xFF4CAF50)),
            _infoRow('Mã giao dịch', payment['transactionId']?.toString() ?? '—', icon: Icons.receipt_long),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(
    String label,
    String value, {
    IconData? icon,
    Color? valueColor,
    double? valueSize,
    FontWeight? fontWeight,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, size: 26, color: const Color(0xFF1976D2)),
            const SizedBox(width: 16),
          ],
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: TextStyle(color: Colors.grey[700], fontSize: valueSize ?? 15.8, fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                fontWeight: fontWeight ?? FontWeight.bold,
                fontSize: valueSize ?? 16.2,
                color: valueColor ?? Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(String? iso) {
    if (iso == null || iso.isEmpty) return '—';
    try {
      final date = DateTime.parse(iso).toLocal();
      return '${date.day}/${date.month}/${date.year} • ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return '—';
    }
  }

  String _statusText(String? s) {
    switch (s) {
      case 'PAID':
      case 'Đã thanh toán':
        return 'Đã thanh toán';
      case 'BOOKED':
        return 'Đang chờ thanh toán';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return s ?? 'Không xác định';
    }
  }

  Color _statusColor(String? s) {
    switch (s) {
      case 'PAID':
      case 'Đã thanh toán':
        return const Color(0xFF4CAF50);
      case 'BOOKED':
        return const Color(0xFFFFA726);
      case 'CANCELLED':
        return const Color(0xFFEF5350);
      default:
        return Colors.grey;
    }
  }

  IconData _statusIcon(String? s) {
    switch (s) {
      case 'PAID':
      case 'Đã thanh toán':
        return Icons.check_circle;
      case 'BOOKED':
        return Icons.schedule;
      case 'CANCELLED':
        return Icons.cancel;
      default:
        return Icons.info;
    }
  }
}