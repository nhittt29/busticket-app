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

  String _formatPrice(String rawPrice) {
    final cleaned = rawPrice.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.isEmpty) return '0đ';
    final formatted = cleaned.replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
    return '$formattedđ';
  }

  String _formatDepartureTime(String? iso) {
    if (iso == null || iso.isEmpty) return '—';
    try {
      final date = DateTime.parse(iso).toLocal();
      return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}, ${date.day}/${date.month}/${date.year}';
    } catch (_) {
      return '—';
    }
  }

  String _formatPaidAt(String? iso) {
    if (iso == null || iso.isEmpty) return 'Chưa thanh toán';
    try {
      final date = DateTime.parse(iso).toLocal();
      return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}, ${date.day}/${date.month}/${date.year}';
    } catch (_) {
      return '—';
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>?>(  
      future: _paymentFuture,
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
                'Nhóm vé',
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

        final payment = snapshot.data!;
        final qrCode = payment['qrCode']?.toString();
        final hasQR = qrCode != null && qrCode.isNotEmpty;
        final isPaid = payment['status'] == 'Đã thanh toán';
        final startPoint = payment['startPoint']?.toString() ?? '—';
        final endPoint = payment['endPoint']?.toString() ?? '—';
        final departureTime = payment['departureTime']?.toString() ?? '';
        final seatList = payment['seatList']?.toString() ?? '';
        final seatCount = payment['seatCount'] as int? ?? 0;
        final seatDisplay = seatCount > 1 ? '$seatList ($seatCount ghế)' : seatList;
        final formattedPrice = _formatPrice(payment['price']?.toString() ?? '0');
        final originalPrice = payment['originalPrice'] as num?;
        final discountAmount = payment['discountAmount'] as num?;
        final hasDiscount = discountAmount != null && discountAmount > 0;
        final formattedOriginalPrice = hasDiscount ? _formatPrice(originalPrice.toString()) : '';
        final formattedDiscount = hasDiscount ? '-${_formatPrice(discountAmount.toString())}' : '';

        final dropoffInfo = payment['dropoffInfo'] as Map<String, dynamic>?;
        final dropoffAddress = payment['dropoffAddress']?.toString();

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
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              tabs: const [
                Tab(text: 'Thông tin vé'),
                Tab(text: 'Thanh toán & QR'),
              ],
            ),
          ),
          body: TabBarView(
            controller: _tabController,
            children: [
              RefreshIndicator(
                onRefresh: () async {
                  setState(() {
                    _paymentFuture =
                        TicketApiService.getPaymentDetailByHistoryId(widget.paymentHistoryId);
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
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.only(bottom: 18),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFDE7),
                            border: Border.all(color: const Color(0xFFFFECB3)),
                            borderRadius: BorderRadius.circular(18),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.info_outline, color: Color(0xFFFF8F00), size: 26),
                              SizedBox(width: 14),
                              Expanded(
                                child: Text(
                                  'Mã QR đang được tạo...\nKéo xuống làm mới sau vài giây',
                                  style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600, color: Color(0xFFE65100)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 22, horizontal: 24),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: const Color(0xFFA0D8F1).withValues(alpha: 0.7),
                            width: 1.4,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withValues(alpha: 0.25),
                              blurRadius: 14,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            _infoRow('Tuyến xe', '$startPoint to\n$endPoint', icon: Icons.directions_bus_filled),
                            _infoRow('Giờ khởi hành', _formatDepartureTime(departureTime), icon: Icons.access_time_filled),
                            _infoRow('Số ghế', seatDisplay, icon: Icons.event_seat, valueSize: 17),

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
                            if (hasDiscount) ...[
                              _infoRow('Giá gốc', formattedOriginalPrice,
                                  icon: Icons.price_change,
                                  valueColor: Colors.grey,
                                  valueSize: 16,
                                  decoration: TextDecoration.lineThrough),
                              _infoRow('Giảm giá', formattedDiscount,
                                  icon: Icons.discount,
                                  valueColor: Colors.red,
                                  valueSize: 16,
                                  fontWeight: FontWeight.bold),
                            ],
                            _infoRow('Tổng tiền', formattedPrice,
                                icon: Icons.paid, valueColor: const Color(0xFF1976D2), valueSize: 23, fontWeight: FontWeight.bold),
                            _infoRow(
                              'Trạng thái',
                              isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
                              icon: isPaid ? Icons.check_circle : Icons.schedule,
                              valueColor: isPaid ? const Color(0xFF4CAF50) : const Color(0xFFFF9800),
                              valueSize: 17,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(18, 20, 18, 40),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 22),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: const Color(0xFFA0D8F1).withValues(alpha: 0.7),
                          width: 1.4,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withValues(alpha: 0.25),
                            blurRadius: 14,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          _infoRow('Mã thanh toán', payment['ticketCode']?.toString() ?? '—', icon: Icons.confirmation_number),
                          _infoRow('Phương thức', payment['paymentMethod']?.toString() ?? '—', icon: Icons.payment),
                          _infoRow('Số tiền', formattedPrice, icon: Icons.attach_money, valueColor: const Color(0xFF1976D2), valueSize: 19),
                          _infoRow(
                            'Thời gian thanh toán',
                            _formatPaidAt(payment['paidAt']?.toString()),
                            icon: Icons.schedule,
                            valueColor: isPaid ? const Color(0xFF4CAF50) : Colors.orange[700],
                          ),
                          _infoRow('Mã giao dịch', payment['transactionId']?.toString() ?? '—', icon: Icons.receipt_long),
                        ],
                      ),
                    ),
                    if (hasQR) ...[
                      const SizedBox(height: 32),
                      Center(
                        child: Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(28),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withValues(alpha: 0.3),
                                blurRadius: 18,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(20),
                                child: Image.network(
                                  qrCode,
                                  width: 260,
                                  height: 260,
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) => const Icon(Icons.qr_code_2, size: 100, color: Colors.grey),
                                ),
                              ),
                              const SizedBox(height: 20),
                              const Text(
                                'Quét mã này để lên xe\n(Áp dụng cho toàn bộ nhóm)',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 16.5,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF01579B),
                                  height: 1.4,
                                ),
                              ),
                              const SizedBox(height: 8),
                              const Icon(Icons.qr_code_scanner, size: 48, color: Color(0xFF4CAF50)),
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

  Widget _infoRow(
    String label,
    String value, {
    IconData? icon,
    Color? valueColor,
    double? valueSize,
    FontWeight? fontWeight,
    TextDecoration? decoration,
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
              style: TextStyle(
                color: Colors.grey[700],
                fontSize: valueSize ?? 15.8,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                fontWeight: fontWeight ?? FontWeight.bold,
                fontSize: valueSize ?? 16,
                color: valueColor ?? Colors.black87,
                decoration: decoration,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
