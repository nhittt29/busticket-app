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
          return Scaffold(
            backgroundColor: const Color(0xFFEAF6FF),
            body: Center(
              child: CircularProgressIndicator(
                color: const Color(0xFF6AB7F5),
                strokeWidth: 3.5,
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
              child: Text('Không tìm thấy thông tin vé', style: TextStyle(fontSize: 17, color: Colors.black54)),
            ),
          );
        }

        final ticket = snapshot.data!;
        final paymentHistoryId = ticket['paymentHistoryId'] as int?;

        // Nếu là vé nhóm → chuyển thẳng sang màn hình nhóm
        if (paymentHistoryId != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (_) => GroupTicketQRScreen(paymentHistoryId: paymentHistoryId),
              ),
            );
          });
          return Scaffold(
            backgroundColor: const Color(0xFFEAF6FF),
            body: Center(child: CircularProgressIndicator(color: Color(0xFF6AB7F5))),
          );
        }

        // Vé lẻ bình thường
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
              style: const TextStyle(color: Colors.white, fontSize: 21, fontWeight: FontWeight.w800, letterSpacing: 0.5),
            ),
            bottom: TabBar(
              controller: _tabController,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              indicatorColor: Colors.white,
              indicatorWeight: 4,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5),
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
    final start = route?['startPoint'] ?? '—';
    final end = route?['endPoint'] ?? '—';
    final departureAt = ticket['schedule']?['departureAt']?.toString() ?? '';
    final seatCode = ticket['seat']?['code']?.toString() ?? '—';
    final priceRaw = (ticket['price'] as num?)?.toInt() ?? 0;
    final price = priceRaw.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 40),
      child: Column(
        children: [
          // Nút Xem mã QR – nhỏ gọn, thanh lịch
          if (isPaid && qrCode != null && qrCode.isNotEmpty)
            Container(
              width: double.infinity,
              height: 56,
              margin: const EdgeInsets.only(bottom: 18),
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => TicketQRScreen(qrUrl: qrCode, ticket: ticket)),
                  );
                },
                icon: const Icon(Icons.qr_code_scanner, size: 26),
                label: const Text('Xem mã QR lên xe', style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50),
                  foregroundColor: Colors.white,
                  elevation: 6,
                  shadowColor: const Color(0xFF4CAF50).withOpacity(0.4),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                ),
              ),
            ),

          // CARD CHÍNH – ĐÃ THU GỌN ĐẸP
          Container(
            padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 22),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFFA0D8F1).withOpacity(0.6), width: 1.3),
              boxShadow: [
                BoxShadow(color: Colors.grey.withOpacity(0.22), blurRadius: 12, offset: const Offset(0, 6)),
              ],
            ),
            child: Column(
              children: [
                _infoRow('Tuyến xe', '$start → $end', icon: Icons.directions_bus_filled),
                _infoRow('Giờ khởi hành', _formatDateTime(departureAt), icon: Icons.access_time_filled),
                _infoRow('Số ghế', seatCode, icon: Icons.event_seat, valueSize: 17),
                _infoRow('Giá vé', '$priceđ', icon: Icons.paid, valueColor: const Color(0xFF1976D2), valueSize: 21, fontWeight: FontWeight.bold),
                const Divider(height: 28, thickness: 1, color: Color(0xFFE8F0FE)),
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

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 40),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: const Color(0xFFA0D8F1).withOpacity(0.6), width: 1.3),
          boxShadow: [
            BoxShadow(color: Colors.grey.withOpacity(0.22), blurRadius: 12, offset: const Offset(0, 6)),
          ],
        ),
        child: Column(
          children: [
            _infoRow('Phương thức', payment['method']?.toString() ?? '—', icon: Icons.payment),
            _infoRow('Số tiền', '$formattedAmountđ', icon: Icons.attach_money, valueColor: const Color(0xFF1976D2), valueSize: 19),
            _infoRow('Trạng thái', payment['status']?.toString() ?? '—', icon: Icons.info, valueColor: _statusColor(payment['status']?.toString())),
            _infoRow('Thời gian thanh toán', _formatDateTime(payment['paidAt']?.toString()), icon: Icons.schedule, valueColor: const Color(0xFF4CAF50)),
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
      padding: const EdgeInsets.symmetric(vertical: 11),
      child: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, size: 24, color: const Color(0xFF1976D2)),
            const SizedBox(width: 14),
          ],
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: TextStyle(color: Colors.grey[700], fontSize: valueSize ?? 15.5, fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                fontWeight: fontWeight ?? FontWeight.bold,
                fontSize: valueSize ?? 15.8,
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
      return '${date.day}/${date.month}/${date.year} • ${date.hour}h${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return iso.split('T').first;
    }
  }

  String _statusText(String? s) {
    switch (s) {
      case 'PAID': case 'Đã thanh toán': return 'Đã thanh toán';
      case 'BOOKED': return 'Đang chờ thanh toán';
      case 'CANCELLED': return 'Đã hủy';
      default: return s ?? 'Không xác định';
    }
  }

  Color _statusColor(String? s) {
    switch (s) {
      case 'PAID': case 'Đã thanh toán': return const Color(0xFF4CAF50);
      case 'BOOKED': return const Color(0xFFFFA726);
      case 'CANCELLED': return const Color(0xFFEF5350);
      default: return Colors.grey;
    }
  }

  IconData _statusIcon(String? s) {
    switch (s) {
      case 'PAID': case 'Đã thanh toán': return Icons.check_circle;
      case 'BOOKED': return Icons.schedule;
      case 'CANCELLED': return Icons.cancel;
      default: return Icons.info;
    }
  }
}