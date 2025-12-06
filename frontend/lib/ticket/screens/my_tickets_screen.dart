// lib/ticket/screens/my_tickets_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../cubit/ticket_cubit.dart';
import '../cubit/ticket_state.dart';
import '../widgets/ticket_card.dart';
import 'ticket_detail_screen.dart';
import 'group_ticket_qr_screen.dart';

class MyTicketsScreen extends StatefulWidget {
  const MyTicketsScreen({super.key});

  @override
  State<MyTicketsScreen> createState() => _MyTicketsScreenState();
}

class _MyTicketsScreenState extends State<MyTicketsScreen> {
  int? _highlightPaymentHistoryId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    final int? paymentHistoryId = args is int ? args : null;

    if (paymentHistoryId != null && paymentHistoryId != _highlightPaymentHistoryId) {
      _highlightPaymentHistoryId = paymentHistoryId;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => GroupTicketQRScreen(paymentHistoryId: paymentHistoryId),
          ),
        ).then((_) {
          if (mounted) {
            setState(() => _highlightPaymentHistoryId = null);
          }
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final userId = context.read<AuthBloc>().state.userId;

    if (userId == null) {
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
            'Vé của tôi',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
        ),
        body: const Center(
          child: Text(
            'Vui lòng đăng nhập để xem vé của bạn',
            style: TextStyle(fontSize: 17, color: Colors.black54, fontWeight: FontWeight.w500),
          ),
        ),
      );
    }

    return BlocProvider(
      create: (_) => TicketCubit()..loadUserTickets(userId),
      child: Scaffold(
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
            'Vé của tôi',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
        ),
        body: BlocBuilder<TicketCubit, TicketState>(
          builder: (context, state) {
            if (state is TicketLoading) {
              return const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF6AB7F5),
                  strokeWidth: 3.5,
                ),
              );
            }

            if (state is TicketError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 64, color: Colors.redAccent),
                    const SizedBox(height: 16),
                    Text(
                      'Lỗi tải dữ liệu',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.grey[800]),
                    ),
                    const SizedBox(height: 8),
                    Text(state.message, style: const TextStyle(color: Colors.black54)),
                  ],
                ),
              );
            }

            if (state is TicketLoaded) {
              final tickets = state.tickets;

              if (tickets.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.confirmation_number_outlined, size: 90, color: Colors.grey[400]),
                      const SizedBox(height: 24),
                      const Text(
                        'Bạn chưa có vé nào',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Đặt vé ngay để bắt đầu hành trình!',
                        style: TextStyle(fontSize: 16, color: Colors.black54),
                      ),
                      const SizedBox(height: 40),
                      ElevatedButton.icon(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.search, color: Colors.white),
                        label: const Text('Tìm chuyến xe', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6AB7F5),
                          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                          elevation: 8,
                        ),
                      ),
                    ],
                  ),
                );
              }

              // Nhóm vé theo paymentHistoryId
              final Map<int?, List<Map<String, dynamic>>> grouped = {};
              for (final t in tickets) {
                final phId = t['paymentHistoryId'] as int?;
                grouped.putIfAbsent(phId, () => []).add(t);
              }

              return RefreshIndicator(
                onRefresh: () async => context.read<TicketCubit>().loadUserTickets(userId),
                color: const Color(0xFF6AB7F5),
                backgroundColor: Colors.white,
                strokeWidth: 3,
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(18, 20, 18, 100), // thu hẹp margin
                  itemCount: grouped.values.length,
                  itemBuilder: (context, index) {
                    final group = grouped.values.toList()[index];
                    final first = group.first;
                    final phId = first['paymentHistoryId'] as int?;
                    final isGroup = group.length > 1;
                    // final highlighted = phId == _highlightPaymentHistoryId; // Đã bỏ highlight

                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 700),
                      curve: Curves.easeOutCubic,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(22), // nhỏ hơn 24
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.18),
                            blurRadius: 10,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: TicketCard(
                        ticket: first,
                        groupTickets: isGroup ? group : null,
                        isHighlighted: false, // Luôn tắt highlight
                        onTap: () {
                          if (phId != null) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => GroupTicketQRScreen(paymentHistoryId: phId),
                              ),
                            );
                          } else {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => TicketDetailScreen(ticketId: first['id'] as int),
                              ),
                            );
                          }
                        },
                      ),
                    );
                  },
                ),
              );
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}