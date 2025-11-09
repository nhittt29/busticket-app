// lib/ticket/screens/my_tickets_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../cubit/ticket_cubit.dart';
import '../cubit/ticket_state.dart';
import 'ticket_detail_screen.dart';

class MyTicketsScreen extends StatefulWidget {
  const MyTicketsScreen({super.key});

  @override
  State<MyTicketsScreen> createState() => _MyTicketsScreenState();
}

class _MyTicketsScreenState extends State<MyTicketsScreen> {
  int? _highlightTicketId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    final int? ticketId = args is int ? args : null;
    if (ticketId != null && ticketId != _highlightTicketId) {
      _highlightTicketId = ticketId;
      final userId = context.read<AuthBloc>().state.userId;
      if (userId != null) {
        context.read<TicketCubit>().loadUserTickets(userId);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final userId = context.read<AuthBloc>().state.userId;
    if (userId == null) {
      return const Scaffold(body: Center(child: Text('Vui lòng đăng nhập')));
    }

    return BlocProvider(
      create: (_) => TicketCubit()..loadUserTickets(userId),
      child: Scaffold(
        backgroundColor: const Color(0xFFEAF6FF),
        appBar: AppBar(
          title: const Text('Vé của tôi', style: TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: const Color(0xFFEAF6FF),
        ),
        body: BlocBuilder<TicketCubit, TicketState>(
          builder: (context, state) {
            if (state is TicketLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            if (state is TicketError) {
              return Center(child: Text('Lỗi: ${state.message}'));
            }
            if (state is TicketLoaded) {
              final tickets = state.tickets;
              if (tickets.isEmpty) {
                return const Center(child: Text('Bạn chưa có vé nào'));
              }

              if (_highlightTicketId != null) {
                final ticket = tickets.firstWhere(
                  (t) => t['id'] == _highlightTicketId,
                  orElse: () => null,
                );
                if (ticket != null && mounted) {
                  Future.microtask(() {
                    if (mounted) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => TicketDetailScreen(ticketId: _highlightTicketId!),
                        ),
                      ).then((_) {
                        if (mounted) {
                          setState(() => _highlightTicketId = null);
                        }
                      });
                    }
                  });
                  _highlightTicketId = null;
                }
              }

              return ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: tickets.length,
                itemBuilder: (context, index) {
                  final ticket = tickets[index];
                  final isPaid = ticket['status'] == 'PAID';
                  final route = ticket['schedule']?['route'];
                  final startPoint = route?['startPoint']?.toString() ?? 'Không rõ';
                  final endPoint = route?['endPoint']?.toString() ?? 'Không rõ';
                  final seatCode = ticket['seat']?['code']?.toString() ?? 'N/A';
                  final departureAt = ticket['schedule']?['departureAt']?.toString() ?? '';
                  final ticketId = ticket['id'];

                  return Card(
                    color: ticketId == _highlightTicketId ? Colors.green.withAlpha(26) : null,
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => TicketDetailScreen(ticketId: ticketId),
                          ),
                        );
                      },
                      leading: CircleAvatar(
                        backgroundColor: _getColor(ticket['status'] ?? 'UNKNOWN'),
                        child: Text('#$ticketId', style: const TextStyle(color: Colors.white, fontSize: 10)),
                      ),
                      title: Text('$startPoint to $endPoint', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('$seatCode • ${_formatDate(departureAt)}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (isPaid) const Icon(Icons.qr_code, color: Colors.green),
                          Chip(
                            label: Text(_getStatusText(ticket['status'] ?? 'UNKNOWN'), style: const TextStyle(fontSize: 10)),
                            backgroundColor: _getColor(ticket['status'] ?? 'UNKNOWN').withAlpha(51),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            }
            return const SizedBox();
          },
        ),
      ),
    );
  }

  Color _getColor(String status) {
    switch (status) {
      case 'PAID': return const Color(0xFF66BB6A);
      case 'BOOKED': return Colors.orange;
      case 'CANCELLED': return Colors.red;
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
    if (iso.isEmpty) return 'Không rõ';
    try {
      final date = DateTime.parse(iso).toLocal();
      return '${date.day}/${date.month} ${date.hour}h${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return 'Không rõ';
    }
  }
}