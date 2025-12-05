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
    final userId = context.read<AuthBloc>().state.user?['id'] as int?;
    if (userId == null || userId <= 0) {
      _ticketsFuture = Future.value([]);
      return;
    }

    _ticketsFuture = TicketApiService.getUserTickets(userId).then((tickets) async {
      final List<Map<String, dynamic>> enriched = [];
      for (final ticket in tickets) {
        try {
          final payment = await TicketApiService.getPaymentDetail(ticket['id'] as int);
          enriched.add({'ticket': ticket, 'payment': payment});
        } catch (e) {
          enriched.add({'ticket': ticket, 'payment': null});
        }
      }
      return enriched;
    }).catchError((_) => <Map<String, dynamic>>[]);
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

                final int totalPrice = group.fold<int>(0, (sum, item) {
                  final price = (item['ticket'] as Map<String, dynamic>)['totalPrice'] as num?;
                  return sum + (price?.toInt() ?? 0);
                });

                final hasQR = group.any((item) {
                  final payment = item['payment'] as Map<String, dynamic>?;
                  return payment != null && payment['qrCode']?.toString().isNotEmpty == true;
                });

                final status = _normalizeStatus(firstTicket['status'] as String? ?? '');

                // ĐIỂM TRẢ KHÁCH – HIỂN THỊ RÕ ĐỊA CHỈ + PHỤ THU ĐỎ (ĐẸP NHƯ GROUPTICKET)
                final dropoffInfo = firstTicket['dropoffInfo'] as Map<String, dynamic>?;
                final dropoffAddress = firstTicket['dropoffAddress']?.toString();

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
                    dropoffTitle: dropoffTitle,
                    dropoffAddressLine: dropoffAddressLine,
                    surchargeText: surchargeText,
                    hasSurcharge: hasSurcharge,
                    discountAmount: (firstTicket['payment'] as Map<String, dynamic>?)?['discountAmount'] as int? ?? 
                                    (group.first['payment'] as Map<String, dynamic>?)?['discountAmount'] as int? ?? 0,
                    promotionCode: (firstTicket['payment'] as Map<String, dynamic>?)?['promotionCode']?.toString() ??
                                   (group.first['payment'] as Map<String, dynamic>?)?['promotionCode']?.toString(),
                    promotionDescription: (firstTicket['payment'] as Map<String, dynamic>?)?['promotionDescription']?.toString() ??
                                          (group.first['payment'] as Map<String, dynamic>?)?['promotionDescription']?.toString(),
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
    required String dropoffTitle,
    required String dropoffAddressLine,
    required String surchargeText,
    required bool hasSurcharge,
    required int discountAmount,
    String? promotionCode,
    String? promotionDescription,
  }) {
    final route = firstTicket['schedule']?['route'] as Map<String, dynamic>?;
    final startPoint = route?['startPoint']?.toString() ?? '—';
    final endPoint = route?['endPoint']?.toString() ?? '—';
    final departureAt = firstTicket['schedule']?['departureAt']?.toString() ?? '';
    final seatCount = groupTickets?.length ?? 1;

    final seatDisplay = groupTickets != null
        ? groupTickets
            .map((t) {
              final seat = t['seat'] as Map<String, dynamic>?;
              return seat?['seatNumber']?.toString() ??
                  seat?['code']?.toString() ??
                  '';
            })
            .where((s) => s.isNotEmpty)
            .join(', ')
        : (firstTicket['seat'] as Map<String, dynamic>?)?.let((s) =>
                s['seatNumber']?.toString() ?? s['code']?.toString()) ??
            '—';

    final originalPrice = totalPrice;
    final finalPrice = totalPrice - discountAmount;

    final formattedOriginalPrice = originalPrice.toString().replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
    
    final formattedFinalPrice = finalPrice.toString().replaceAllMapped(
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
          if (paymentHistoryId != null && paymentHistoryId > 0) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => GroupTicketQRScreen(paymentHistoryId: paymentHistoryId),
              ),
            );
          } else {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => TicketDetailScreen(ticketId: firstTicket['id'] as int),
              ),
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

              // ĐIỂM TRẢ KHÁCH – RÕ RÀNG, ĐẸP NHƯ GROUPTICKET
              if (dropoffTitle != 'Bến xe đích' || hasSurcharge) ...[
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
                          Text(
                            dropoffTitle,
                            style: const TextStyle(fontSize: 14, color: Color(0xFF2E7D32), fontWeight: FontWeight.bold),
                          ),
                          if (dropoffAddressLine.isNotEmpty) ...[
                            const SizedBox(height: 3),
                            Text(
                              dropoffAddressLine,
                              style: const TextStyle(fontSize: 14.2, color: Colors.black87, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (hasSurcharge)
                      Text(
                        surchargeText,
                        style: const TextStyle(
                          fontSize: 14.5,
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
                  if (discountAmount > 0)
                    Row(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '${formattedOriginalPrice}đ',
                              style: const TextStyle(
                                fontSize: 13,
                                color: Colors.grey,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                            if (promotionCode != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                margin: const EdgeInsets.only(top: 2),
                                decoration: BoxDecoration(
                                  color: Colors.purple.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: Colors.purple.withOpacity(0.3)),
                                ),
                                child: Text(
                                  promotionCode,
                                  style: const TextStyle(fontSize: 10, color: Colors.purple, fontWeight: FontWeight.bold),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${formattedFinalPrice}đ',
                          style: const TextStyle(
                            fontSize: 19,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFFF5722), // Red/Orange color
                          ),
                        ),
                      ],
                    )
                  else
                    Text(
                      '${formattedOriginalPrice}đ',
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
    final s = status.toUpperCase();
    if (s.contains('PAID') || s.contains('THANH TOÁN')) return 'PAID';
    if (s.contains('BOOKED') || s.contains('CHỜ')) return 'BOOKED';
    if (s.contains('CANCELLED') || s.contains('HỦY')) return 'CANCELLED';
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

// Extension để tránh null crash
extension on Map<String, dynamic>? {
  T? let<T>(T Function(Map<String, dynamic>) block) {
    if (this == null) return null;
    return block(this!);
  }
}