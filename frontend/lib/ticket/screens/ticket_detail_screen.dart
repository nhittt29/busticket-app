// lib/ticket/screens/ticket_detail_screen.dart
import 'package:flutter/material.dart';
import '../services/ticket_api_service.dart';
import 'cancel_ticket_dialog.dart';
import 'ticket_qr_screen.dart';

class TicketDetailScreen extends StatefulWidget {
  final int ticketId;
  const TicketDetailScreen({
    super.key,
    required this.ticketId,
  });
  @override
  State<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends State<TicketDetailScreen>
    with TickerProviderStateMixin {
  late Future<Map<String, dynamic>> _ticketFuture;
  late Future<Map<String, dynamic>?> _paymentFuture;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _ticketFuture = TicketApiService.getTicketDetail(widget.ticketId);
    _paymentFuture = TicketApiService.getPaymentDetail(widget.ticketId);
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
      builder: (context, ticketSnapshot) {
        if (ticketSnapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: Color(0xFFEAF6FF),
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (ticketSnapshot.hasError || !ticketSnapshot.hasData) {
          return _buildError(context, 'Không tìm thấy vé', id: widget.ticketId);
        }
        final ticket = ticketSnapshot.data!;
        return FutureBuilder<Map<String, dynamic>?>(
          future: _paymentFuture,
          builder: (context, paymentSnapshot) {
            final payment = paymentSnapshot.data;
            return _buildWithTabs(context, ticket, payment);
          },
        );
      },
    );
  }

  Widget _buildWithTabs(
    BuildContext context,
    Map<String, dynamic> ticket,
    Map<String, dynamic>? payment,
  ) {
    final isPaid = ticket['status'] == 'PAID';
    final qrCode = payment?['qrCode']?.toString();
    final userId = ticket['userId'] as int?;
    final route = ticket['schedule']?['route'] as Map<String, dynamic>?;
    final startPoint = route?['startPoint']?.toString() ?? 'Không rõ';
    final endPoint = route?['endPoint']?.toString() ?? 'Không rõ';
    final departureAt = ticket['schedule']?['departureAt']?.toString() ?? '';
    final seatCode = ticket['seat']?['code']?.toString() ?? 'N/A';
    final price = (ticket['price'] as num?)?.toStringAsFixed(0) ?? '0';
    final canCancel = _canCancelTicket(departureAt);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFEAF6FF),
        appBar: AppBar(
          title: Text('Vé #${ticket['id']}'),
          backgroundColor: const Color(0xFFEAF6FF),
          elevation: 0,
          bottom: TabBar(
            controller: _tabController,
            labelColor: const Color(0xFF023E8A),
            unselectedLabelColor: Colors.grey[600],
            indicatorColor: const Color(0xFF023E8A),
            indicatorWeight: 3,
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            tabs: const [
              Tab(text: 'Thông tin vé'),
              Tab(text: 'Lịch sử thanh toán'),
            ],
          ),
        ),
        body: TabBarView(
          controller: _tabController,
          children: [
            // TAB 1: THÔNG TIN VÉ
            _buildTicketInfoTab(context, ticket, isPaid, qrCode, canCancel, userId, startPoint, endPoint, departureAt, seatCode, price),
            // TAB 2: LỊCH SỬ THANH TOÁN
            _buildPaymentHistoryTab(context, payment, ticket['id'], qrCode),
          ],
        ),
      ),
    );
  }

  Widget _buildTicketInfoTab(
    BuildContext context,
    Map<String, dynamic> ticket,
    bool isPaid,
    String? qrCode,
    bool canCancel,
    int? userId,
    String startPoint,
    String endPoint,
    String departureAt,
    String seatCode,
    String price,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          if (isPaid && qrCode != null && qrCode.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.qr_code_2, size: 28),
                  label: const Text('Xem mã QR', style: TextStyle(fontSize: 18)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF66BB6A),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 3,
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => TicketQRScreen(
                          qrUrl: qrCode,
                          ticket: ticket,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          Card(
            elevation: 3,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _info('Tuyến', '$startPoint → $endPoint'),
                  _info('Giờ đi', _formatDate(departureAt)),
                  _info('Ghế', seatCode),
                  _info('Giá', '$priceđ'),
                  _info('Trạng thái', _statusText(ticket['status']), color: _statusColor(ticket['status'])),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          if (ticket['status'] == 'BOOKED' && canCancel && userId != null)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => showDialog(
                  context: context,
                  builder: (_) => CancelTicketDialog(
                    ticketId: ticket['id'],
                    userId: userId,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 3,
                ),
                child: const Text('Hủy vé', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ),
          if (ticket['status'] == 'BOOKED' && !canCancel)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  border: Border.all(color: Colors.orange.shade300),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.access_time, color: Colors.orange.shade700, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Không thể hủy vé: Chỉ được hủy trước 2 giờ khởi hành.',
                        style: TextStyle(color: Colors.orange.shade800, fontSize: 14, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPaymentHistoryTab(
    BuildContext context,
    Map<String, dynamic>? payment,
    dynamic ticketId,
    String? qrCode,
  ) {
    if (payment == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'Chưa có lịch sử thanh toán',
              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
            ),
            const SizedBox(height: 8),
            Text(
              'Vé đang ở trạng thái chờ thanh toán',
              style: TextStyle(fontSize: 14, color: Colors.grey[500]),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Card(
            elevation: 3,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _info('Mã vé', payment['ticketCode'] ?? 'V${ticketId.toString().padLeft(6, '0')}'),
                  _info('Tuyến xe', payment['route'] ?? 'Không rõ'),
                  _info('Giờ khởi hành', payment['departureTime'] ?? 'Không rõ'),
                  _info('Số ghế', payment['seatNumber']?.toString() ?? 'N/A'),
                  _info('Giá vé', payment['price'] ?? '0đ'),
                  _info('Phương thức', payment['paymentMethod'] ?? 'Không rõ'),
                  _info('Trạng thái', payment['status'] ?? 'Không rõ'),
                  _info('Thời gian thanh toán', payment['paidAt'] ?? 'Không rõ'),
                  _info('Mã giao dịch', payment['transactionId'] ?? '—'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          if (qrCode != null && qrCode.isNotEmpty)
            Center(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  qrCode,
                  width: 220,
                  height: 220,
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const Icon(Icons.qr_code, size: 220, color: Colors.grey),
                ),
              ),
            ),
          const SizedBox(height: 16),
          if (qrCode != null && qrCode.isNotEmpty)
            Text(
              'Quét mã QR để lên xe',
              style: TextStyle(fontSize: 15, color: Colors.grey[700], fontWeight: FontWeight.w500),
            ),
        ],
      ),
    );
  }

  bool _canCancelTicket(String departureAtIso) {
    if (departureAtIso.isEmpty) return false;
    try {
      final departure = DateTime.parse(departureAtIso).toLocal();
      final now = DateTime.now();
      final diffHours = departure.difference(now).inMinutes / 60.0;
      return diffHours >= 2.0;
    } catch (e) {
      return false;
    }
  }

  Widget _buildError(BuildContext context, String message, {int? id}) {
    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF),
      appBar: AppBar(title: const Text('Chi tiết vé'), backgroundColor: const Color(0xFFEAF6FF), elevation: 0),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 56),
            const SizedBox(height: 16),
            Text(message, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            if (id != null) Text('ID: $id', style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.arrow_back),
              label: const Text('Quay lại'),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1976D2)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _info(String label, String value, {Color? color}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 15)),
            Flexible(
              child: Text(
                value,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: color),
                textAlign: TextAlign.end,
              ),
            ),
          ],
        ),
      );

  String _formatDate(String iso) {
    if (iso.isEmpty) return 'Không rõ';
    try {
      final date = DateTime.parse(iso).toLocal();
      return '${date.day}/${date.month} lúc ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return 'Không rõ';
    }
  }

  String _statusText(String s) => {
        'PAID': 'Đã thanh toán',
        'BOOKED': 'Đang chờ',
        'CANCELLED': 'Đã hủy'
      }[s] ?? s;

  Color _statusColor(String s) => {
        'PAID': const Color(0xFF66BB6A),
        'BOOKED': Colors.orange,
        'CANCELLED': Colors.red,
      }[s] ?? Colors.grey;
}