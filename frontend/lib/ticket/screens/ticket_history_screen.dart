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
      if (userId == null) {
        throw Exception('Chưa đăng nhập');
      }

      final tickets = await TicketApiService.getUserTickets(userId);

      final List<Map<String, dynamic>> enriched = [];
      for (final ticket in tickets) {
        final ticketId = ticket['id'] as int;
        final payment = await TicketApiService.getPaymentDetail(ticketId);
        enriched.add({
          'ticket': ticket,
          'payment': payment,
        });
      }
      return enriched;
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi tải lịch sử: $e')),
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
        title: const Text(
          'Lịch sử đặt vé',
          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF4CAF50),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          indicatorWeight: 3,
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
            return const Center(child: Text('Vui lòng đăng nhập để xem lịch sử'));
          }

          return FutureBuilder<List<Map<String, dynamic>>>(
            future: _ticketsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError || !snapshot.hasData) {
                return Center(child: Text('Lỗi: ${snapshot.error}'));
              }

              final allTickets = snapshot.data!;
              final filtered = allTickets.where((item) {
                final status = item['ticket']['status'] as String?;
                if (_selectedFilter == 'ALL') return true;
                return status == _selectedFilter;
              }).toList();

              if (filtered.isEmpty) {
                return _buildEmptyState(_selectedFilter);
              }

              return ListView.builder(
                padding: const EdgeInsets.all(12),
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

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 6),
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => TicketDetailScreen(ticketId: ticket['id']),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: _getStatusColor(status),
                    child: Text(
                      '#$ticketId',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '$startPoint → $endPoint',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF023E8A)),
                    ),
                  ),
                  if (hasQR)
                    const Icon(Icons.qr_code, color: Color(0xFF66BB6A), size: 20),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Ghế: $seatCode • ${_formatDate(departureAt)}',
                style: TextStyle(color: Colors.grey[700], fontSize: 13),
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${price}đ',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF023E8A)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getStatusColor(status).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _getStatusText(status),
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _getStatusColor(status)),
                    ),
                  ),
                ],
              ),
              if (status == 'PAID' && paidAt.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    'Thanh toán: $method • $paidAt',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String filter) {
    final Map<String, String> messages = {
      'ALL': 'Bạn chưa đặt vé nào',
      'PAID': 'Chưa có vé đã thanh toán',
      'BOOKED': 'Không có vé đang chờ',
      'CANCELLED': 'Không có vé đã hủy',
    };

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            messages[filter]!,
            style: TextStyle(fontSize: 16, color: Colors.grey[600]),
          ),
          const SizedBox(height: 8),
          Text(
            'Đặt vé ngay để xem lịch sử!',
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PAID':
        return const Color(0xFF66BB6A);
      case 'BOOKED':
        return const Color(0xFFFFA726);
      case 'CANCELLED':
        return const Color(0xFFEF5350);
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'BOOKED':
        return 'Đang chờ';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  String _formatDate(String iso) {
    if (iso.isEmpty) return '—';
    try {
      final date = DateTime.parse(iso).toLocal();
      return '${date.day}/${date.month} ${date.hour}h${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return '—';
    }
  }
}