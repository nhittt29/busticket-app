// lib/ticket/screens/ticket_history_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../../bloc/auth/auth_state.dart';
import '../services/ticket_api_service.dart';
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
    _ticketsFuture = _fetchTicketsWithPayment();
  }

  Future<List<Map<String, dynamic>>> _fetchTicketsWithPayment() async {
    try {
      final userId = context.read<AuthBloc>().state.userId;
      if (userId == null) throw Exception('Chưa đăng nhập');

      final tickets = await TicketApiService.getUserTickets(userId);
      final List<Map<String, dynamic>> enriched = [];

      for (final ticket in tickets) {
        final ticketId = ticket['id'] as int;
        final payment = await TicketApiService.getPaymentDetail(ticketId);
        enriched.add({'ticket': ticket, 'payment': payment});
      }
      return enriched;
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Lỗi tải lịch sử vé', style: TextStyle(fontWeight: FontWeight.w600)),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
      return [];
    }
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
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
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
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, authState) {
          if (authState.userId == null) {
            return const Center(
              child: Text(
                'Vui lòng đăng nhập để xem lịch sử đặt vé',
                style: TextStyle(fontSize: 16, color: Colors.black54),
              ),
            );
          }

          return FutureBuilder<List<Map<String, dynamic>>>(
            future: _ticketsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator(color: Color(0xFF6AB7F5)));
              }
              if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
                return _buildEmptyState(_selectedFilter);
              }

              final filtered = snapshot.data!.where((item) {
                final status = item['ticket']['status'] as String? ?? '';
                return _selectedFilter == 'ALL' || status == _selectedFilter;
              }).toList();

              if (filtered.isEmpty) return _buildEmptyState(_selectedFilter);

              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: filtered.length,
                itemBuilder: (context, index) {
                  final item = filtered[index];
                  final ticket = item['ticket'] as Map<String, dynamic>;
                  final payment = item['payment'] as Map<String, dynamic>?;
                  return _buildHistoryCard(context, ticket, payment);
                },
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildHistoryCard(
    BuildContext context,
    Map<String, dynamic> ticket,
    Map<String, dynamic>? payment,
  ) {
    final route = ticket['schedule']?['route'] as Map<String, dynamic>?;
    final startPoint = route?['startPoint'] ?? '—';
    final endPoint = route?['endPoint'] ?? '—';
    final departureAt = ticket['schedule']?['departureAt'] ?? '';
    final seatCode = ticket['seat']?['code'] ?? '—';
    final price = (ticket['price'] as num?)?.toStringAsFixed(0) ?? '0';
    final status = ticket['status'] ?? 'UNKNOWN';
    final ticketId = ticket['id'].toString();
    final paidAt = payment?['paidAt'] ?? '';
    final method = payment?['paymentMethod'] ?? '';
    final hasQR = payment?['qrCode'] != null;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFA0D8F1).withOpacity(0.4), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withAlpha(30),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => TicketDetailScreen(ticketId: ticket['id']),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _getStatusColor(status),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '#$ticketId',
                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      '$startPoint → $endPoint',
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF023E8A),
                      ),
                    ),
                  ),
                  if (hasQR)
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF66BB6A).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.qr_code_scanner, color: Color(0xFF66BB6A), size: 22),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.event_seat, size: 18, color: Colors.black54),
                  const SizedBox(width: 6),
                  Text(
                    'Ghế: $seatCode',
                    style: const TextStyle(fontSize: 14.5, color: Colors.black87, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(width: 16),
                  const Icon(Icons.access_time, size: 18, color: Colors.black54),
                  const SizedBox(width: 6),
                  Text(
                    _formatDate(departureAt),
                    style: const TextStyle(fontSize: 14.5, color: Colors.black87, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${price.replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}đ',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1976D2),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: _getStatusColor(status).withAlpha(38),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _getStatusText(status),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: _getStatusColor(status),
                      ),
                    ),
                  ),
                ],
              ),
              if (status == 'PAID' && paidAt.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Row(
                    children: [
                      const Icon(Icons.payment, size: 16, color: Colors.black54),
                      const SizedBox(width: 6),
                      Text(
                        'Thanh toán bằng $method • ${_formatPaidDate(paidAt)}',
                        style: TextStyle(fontSize: 13, color: Colors.grey[700]),
                      ),
                    ],
                  ),
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
          Icon(Icons.confirmation_number_outlined, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 20),
          Text(
            messages[filter]!,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.black54),
          ),
          const SizedBox(height: 10),
          const Text(
            'Đặt vé ngay để theo dõi hành trình!',
            style: TextStyle(fontSize: 15, color: Colors.black45),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PAID':      return const Color(0xFF4CAF50);
      case 'BOOKED':    return const Color(0xFFFFA726);
      case 'CANCELLED': return const Color(0xFFEF5350);
      default:          return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'PAID':      return 'Đã thanh toán';
      case 'BOOKED':    return 'Đang chờ';
      case 'CANCELLED': return 'Đã hủy';
      default:          return status;
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

  String _formatPaidDate(String iso) {
    if (iso.isEmpty) return '';
    try {
      final date = DateTime.parse(iso).toLocal();
      return '${date.day}/${date.month} ${date.hour}h${date.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return iso;
    }
  }
}