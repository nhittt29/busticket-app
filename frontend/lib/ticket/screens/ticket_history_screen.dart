// lib/ticket/screens/ticket_history_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../services/ticket_api_service.dart';
import 'group_ticket_qr_screen.dart';
import 'ticket_detail_screen.dart';

class TicketHistoryScreen extends StatefulWidget {
  const TicketHistoryScreen({super.key});

  @override
  State<TicketHistoryScreen> createState() => _TicketHistoryScreenState();
}

class _TicketHistoryScreenState extends State<TicketHistoryScreen>
    with SingleTickerProviderStateMixin {
  late Future<List<Map<String, dynamic>>> _ticketsFuture;
  late TabController _tabController;
  String _selectedFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadTickets();
  }

  void _loadTickets() {
    final userId = context.read<AuthBloc>().state.userId;
    if (userId == null) return;

    _ticketsFuture = TicketApiService.getUserTickets(userId).then((tickets) async {
      final List<Map<String, dynamic>> enriched = [];
      for (final ticket in tickets) {
        final payment = await TicketApiService.getPaymentDetail(ticket['id'] as int);
        enriched.add({'ticket': ticket, 'payment': payment});
      }
      return enriched;
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
          'Lịch sử đặt vé',
          style: TextStyle(
            color: Colors.white,
            fontSize: 22,
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
          onTap: (index) {
            setState(() {
              _selectedFilter = ['ALL', 'PAID', 'BOOKED', 'CANCELLED'][index];
            });
          },
          tabs: const [
            Tab(text: 'Tất cả'),
            Tab(text: 'Đã thanh toán'),
            Tab(text: 'Đang chờ'),
            Tab(text: 'Đã hủy'),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() => _loadTickets());
        },
        color: const Color(0xFF6AB7F5),
        backgroundColor: Colors.white,
        strokeWidth: 3,
        child: FutureBuilder<List<Map<String, dynamic>>>(
          future: _ticketsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(
                child: CircularProgressIndicator(color: Color(0xFF6AB7F5), strokeWidth: 3.5),
              );
            }

            if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
              return _buildEmptyState(_selectedFilter);
            }

            // GỘP THEO paymentHistoryId
            final Map<int?, List<Map<String, dynamic>>> grouped = {};
            for (final item in snapshot.data!) {
              final ticket = item['ticket'] as Map<String, dynamic>;
              final phId = ticket['paymentHistoryId'] as int?;
              grouped.putIfAbsent(phId, () => []).add(item);
            }

            final filteredGroups = grouped.values.where((group) {
              final rawStatus = (group.first['ticket'] as Map<String, dynamic>)['status'] as String? ?? '';
              final normalized = _normalizeStatus(rawStatus);
              return _selectedFilter == 'ALL' || normalized == _selectedFilter;
            }).toList();

            if (filteredGroups.isEmpty) return _buildEmptyState(_selectedFilter);

            return ListView.builder(
              padding: const EdgeInsets.fromLTRB(18, 20, 18, 100),
              itemCount: filteredGroups.length,
              itemBuilder: (context, index) {
                final group = filteredGroups[index];
                final firstTicket = group.first['ticket'] as Map<String, dynamic>;
                final paymentHistoryId = firstTicket['paymentHistoryId'] as int?;
                final isGroup = group.length > 1;

                final int totalPrice = group.fold<int>(
                  0,
                  (sum, item) => sum + ((item['ticket'] as Map<String, dynamic>)['totalPrice'] as num? ?? 0).toInt(),
                );

                final hasQR = group.any((item) =>
                    item['payment'] != null &&
                    (item['payment'] as Map<String, dynamic>)['qrCode'] != null);

                final status = _normalizeStatus(firstTicket['status'] as String? ?? '');

                // ĐIỂM TRẢ KHÁCH – ĐÃ THÊM ĐẸP LUNG LINH
                final dropoffInfo = firstTicket['dropoffInfo'] as Map<String, dynamic>?;
                final dropoffDisplay = dropoffInfo?['display']?.toString() ?? 'Bến xe đích';
                final dropoffSurchargeText = dropoffInfo?['surchargeText']?.toString() ?? 'Miễn phí';
                final hasSurcharge = dropoffSurchargeText != 'Miễn phí';

                return AnimatedContainer(
                  duration: const Duration(milliseconds: 600),
                  curve: Curves.easeOutCubic,
                  margin: const EdgeInsets.only(bottom: 16),
                  child: _buildHistoryCard(
                    context: context,
                    firstTicket: firstTicket,
                    groupTickets: isGroup ? group.map((e) => e['ticket'] as Map<String, dynamic>).toList() : null,
                    paymentHistoryId: paymentHistoryId,
                    totalPrice: totalPrice,
                    hasQR: hasQR,
                    status: status,
                    dropoffDisplay: dropoffDisplay,
                    dropoffSurchargeText: dropoffSurchargeText,
                    hasSurcharge: hasSurcharge,
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildHistoryCard({
    required BuildContext context,
    required Map<String, dynamic> firstTicket,
    required List<Map<String, dynamic>>? groupTickets,
    required int? paymentHistoryId,
    required int totalPrice,
    required bool hasQR,
    required String status,
    required String dropoffDisplay,
    required String dropoffSurchargeText,
    required bool hasSurcharge,
  }) {
    final route = firstTicket['schedule']?['route'] as Map<String, dynamic>?;
    final startPoint = route?['startPoint'] ?? '—';
    final endPoint = route?['endPoint'] ?? '—';
    final departureAt = firstTicket['schedule']?['departureAt']?.toString() ?? '';
    final seatCount = groupTickets?.length ?? 1;

    final seatDisplay = groupTickets != null
        ? groupTickets
            .map((t) => t['seat']?['code']?.toString() ?? '')
            .where((s) => s.isNotEmpty)
            .join(', ')
        : firstTicket['seat']?['code']?.toString() ?? '—';

    final formattedPrice = totalPrice.toString().replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFA0D8F1).withOpacity(0.6), width: 1.3),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.22),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: () {
          if (paymentHistoryId != null) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => GroupTicketQRScreen(paymentHistoryId: paymentHistoryId)),
            );
          } else {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => TicketDetailScreen(ticketId: firstTicket['id'] as int)),
            );
          }
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
                    decoration: BoxDecoration(
                      color: _getStatusColor(status),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '#${paymentHistoryId ?? firstTicket['id']}',
                      style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      '$startPoint → $endPoint',
                      style: const TextStyle(fontSize: 17.5, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
                    ),
                  ),
                  if (hasQR && status == 'PAID')
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF4CAF50).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(
                        groupTickets != null ? Icons.group : Icons.qr_code_scanner,
                        color: const Color(0xFF4CAF50),
                        size: 24,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  const Icon(Icons.event_seat, size: 19, color: Colors.black54),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      seatCount > 1 ? '$seatCount ghế: $seatDisplay' : 'Ghế: $seatDisplay',
                      style: const TextStyle(fontSize: 15, color: Colors.black87, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 7),
              Row(
                children: [
                  const Icon(Icons.access_time_filled, size: 19, color: Colors.black54),
                  const SizedBox(width: 8),
                  Text(
                    _formatDate(departureAt),
                    style: const TextStyle(fontSize: 15, color: Colors.black87, fontWeight: FontWeight.w600),
                  ),
                ],
              ),

              // ĐIỂM TRẢ KHÁCH – ĐẸP NHƯ VEXERE
              if (dropoffDisplay != 'Bến xe đích') ...[
                const SizedBox(height: 10),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.location_on, size: 19, color: Color(0xFFFF6B6B)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Trả khách tại',
                            style: TextStyle(fontSize: 13, color: Colors.black54, fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            dropoffDisplay,
                            style: const TextStyle(fontSize: 15, color: Color(0xFF2E7D32), fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    if (hasSurcharge)
                      Text(
                        dropoffSurchargeText,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFD32F2F),
                        ),
                      ),
                  ],
                ),
              ],

              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '$formattedPriceđ',
                    style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: Color(0xFF1976D2)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: _getStatusColor(status).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Text(
                      _getStatusText(status),
                      style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: _getStatusColor(status)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String filter) {
    final messages = {
      'ALL': 'Bạn chưa đặt vé nào',
      'PAID': 'Chưa có vé đã thanh toán',
      'BOOKED': 'Không có vé đang chờ',
      'CANCELLED': 'Không có vé đã hủy',
    };

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.confirmation_number_outlined, size: 90, color: Colors.grey[400]),
          const SizedBox(height: 24),
          Text(
            messages[filter] ?? 'Không có dữ liệu',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
          ),
          const SizedBox(height: 12),
          const Text(
            'Đặt vé ngay để theo dõi hành trình!',
            style: TextStyle(fontSize: 16, color: Colors.black54),
          ),
        ],
      ),
    );
  }

  String _normalizeStatus(String status) {
    if (status.toUpperCase().contains('PAID') || status.contains('thanh toán')) return 'PAID';
    if (status.toUpperCase().contains('BOOKED') || status.contains('chờ')) return 'BOOKED';
    if (status.toUpperCase().contains('CANCELLED') || status.contains('hủy')) return 'CANCELLED';
    return 'ALL';
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PAID': return const Color(0xFF4CAF50);
      case 'BOOKED': return const Color(0xFFFFA726);
      case 'CANCELLED': return const Color(0xFFEF5350);
      default: return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'PAID': return 'Đã thanh toán';
      case 'BOOKED': return 'Đang chờ';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  }

  String _formatDate(String iso) {
    if (iso.isEmpty) return '—';
    try {
      final date = DateTime.parse(iso).toLocal();
      return '${date.day}/${date.month} • ${date.hour}h${date.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '—';
    }
  }
}