// lib/ticket/screens/group_ticket_qr_screen.dart
import 'package:flutter/material.dart';
import '../services/ticket_api_service.dart';

class GroupTicketQRScreen extends StatefulWidget {
  final int paymentHistoryId;
  const GroupTicketQRScreen({super.key, required this.paymentHistoryId});

  @override
  State<GroupTicketQRScreen> createState() => _GroupTicketQRScreenState();
}

class _GroupTicketQRScreenState extends State<GroupTicketQRScreen>
    with TickerProviderStateMixin {
  late Future<Map<String, dynamic>?> _paymentFuture;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _paymentFuture =
        TicketApiService.getPaymentDetailByHistoryId(widget.paymentHistoryId);
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _buildSeatDisplay(Map<String, dynamic> payment) {
    final String? seatListFromBackend = payment['seatList']?.toString();
    if (seatListFromBackend != null && seatListFromBackend.isNotEmpty) {
      final count = payment['seatCount'] ?? payment['ticketIds']?.length ?? 0;
      return count > 1 ? '$seatListFromBackend ($count ghế)' : seatListFromBackend;
    }

    final String seatNumber = payment['seatNumber']?.toString() ?? '';
    final List<dynamic>? ticketIds = payment['ticketIds'] as List<dynamic>?;

    if (ticketIds == null || ticketIds.isEmpty) return '—';

    final int count = ticketIds.length;

    if (count == 1 && seatNumber.isNotEmpty && seatNumber != '—' && !seatNumber.contains('ghế')) {
      return seatNumber;
    }

    return '$count ghế';
  }

  String _formatPrice(String rawPrice) {
    final cleaned = rawPrice.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.isEmpty) return '0đ';
    final formatted = cleaned.replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
    return '$formattedđ';
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>?>(
      future: _paymentFuture,
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
                'Nhóm vé',
                style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
              ),
            ),
            body: const Center(
              child: Text('Không tìm thấy thông tin', style: TextStyle(fontSize: 16, color: Colors.black54)),
            ),
          );
        }

        final payment = snapshot.data!;
        final qrCode = payment['qrCode']?.toString();
        final hasQR = qrCode != null && qrCode.isNotEmpty;
        final isPaid = payment['status'] == 'Đã thanh toán' ||
            payment['paidAt'] != null ||
            payment['transactionId'] != null;

        final route = payment['route']?.toString() ?? 'Không rõ tuyến đường';
        final departureTime = payment['departureTime']?.toString() ?? 'Không rõ giờ';
        final seatDisplay = _buildSeatDisplay(payment);
        final formattedPrice = _formatPrice(payment['price']?.toString() ?? '0');
        final paymentMethod = payment['paymentMethod']?.toString() ?? '—';
        final paidAt = payment['paidAt']?.toString() ?? '—';
        final transactionId = payment['transactionId']?.toString() ?? '—';

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
              'Nhóm vé #${widget.paymentHistoryId}',
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
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5),
              tabs: const [
                Tab(text: 'Thông tin vé'),
                Tab(text: 'Thanh toán & QR'),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tabController,
            children: [
              // TAB 1: THÔNG TIN VÉ
              RefreshIndicator(
                onRefresh: () async {
                  setState(() {
                    _paymentFuture = TicketApiService.getPaymentDetailByHistoryId(widget.paymentHistoryId);
                  });
                },
                color: const Color(0xFF6AB7F5),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(18, 20, 18, 40),
                  child: Column(
                    children: [
                      if (!hasQR && isPaid)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF3E0),
                            border: Border.all(color: const Color(0xFFFFCC80)),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            children: const [
                              Icon(Icons.info_outline, color: Color(0xFFFF8F00), size: 24),
                              SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'Mã QR đang được tạo...\nKéo xuống làm mới sau vài giây',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFFE65100)),
                                ),
                              ),
                            ],
                          ),
                        ),

                      if (!hasQR && !isPaid)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE3F2FD),
                            border: Border.all(color: const Color(0xFF90CAF9)),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            children: const [
                              Icon(Icons.access_time, color: Color(0xFF1976D2), size: 24),
                              SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  'Đang chờ thanh toán thành công',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF0D47A1)),
                                ),
                              ),
                            ],
                          ),
                        ),

                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 22),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: Color(0xFFA0D8F1).withValues(alpha: 0.6), width: 1.3),
                          boxShadow: [
                            BoxShadow(color: Colors.grey.withValues(alpha: 0.22), blurRadius: 12, offset: const Offset(0, 6)),
                          ],
                        ),
                        child: Column(
                          children: [
                            _infoRow('Tuyến xe', route, icon: Icons.directions_bus_filled),
                            _infoRow('Giờ khởi hành', departureTime, icon: Icons.access_time_filled),
                            _infoRow('Số ghế', seatDisplay, icon: Icons.event_seat, valueSize: 17),
                            _infoRow('Tổng tiền', formattedPrice, icon: Icons.paid, valueColor: const Color(0xFF1976D2), valueSize: 22, fontWeight: FontWeight.bold),
                            const Divider(height: 28, thickness: 1, color: Color(0xFFE8F0FE)),
                            _infoRow(
                              'Trạng thái',
                              isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
                              icon: isPaid ? Icons.check_circle : Icons.schedule,
                              valueColor: isPaid ? const Color(0xFF4CAF50) : const Color(0xFFFFA726),
                              valueSize: 17,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // TAB 2: THANH TOÁN & QR
              SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(18, 20, 18, 40),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: Color(0xFFA0D8F1).withValues(alpha: 0.6), width: 1.3),
                        boxShadow: [
                          BoxShadow(color: Colors.grey.withValues(alpha: 0.22), blurRadius: 12, offset: const Offset(0, 6)),
                        ],
                      ),
                      child: Column(
                        children: [
                          _infoRow('Mã thanh toán', payment['ticketCode']?.toString() ?? '—', icon: Icons.confirmation_number),
                          _infoRow('Phương thức', paymentMethod, icon: Icons.payment),
                          _infoRow('Số tiền', formattedPrice, icon: Icons.attach_money, valueColor: const Color(0xFF1976D2), valueSize: 18),
                          _infoRow('Thời gian', paidAt.isNotEmpty ? paidAt : 'Chưa thanh toán', icon: Icons.schedule, valueColor: paidAt.isNotEmpty ? const Color(0xFF4CAF50) : Colors.orange),
                          _infoRow('Mã giao dịch', transactionId, icon: Icons.receipt_long),
                        ],
                      ),
                    ),

                    if (hasQR) ...[
                      const SizedBox(height: 28),
                      Center(
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(26),
                            boxShadow: [
                              BoxShadow(color: Colors.grey.withValues(alpha: 0.25), blurRadius: 16, offset: const Offset(0, 8)),
                            ],
                          ),
                          child: Column(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(18),
                                child: Image.network(qrCode, width: 240, height: 240, fit: BoxFit.contain), // ĐÃ XÓA ! – AN TOÀN VÌ hasQR ĐÃ KIỂM TRA
                              ),
                              const SizedBox(height: 18),
                              const Text(
                                'Quét mã này để lên xe\n(Áp dụng cho toàn bộ nhóm)',
                                textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
                              ),
                              const SizedBox(height: 6),
                              const Icon(Icons.qr_code_scanner, size: 44, color: Color(0xFF4CAF50)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _infoRow(String label, String value,
      {IconData? icon, Color? valueColor, double? valueSize, FontWeight? fontWeight}) {
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
}