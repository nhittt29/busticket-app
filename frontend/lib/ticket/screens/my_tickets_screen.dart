// lib/ticket/screens/my_tickets_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../cubit/ticket_cubit.dart';
import '../cubit/ticket_state.dart';
import '../widgets/ticket_card.dart';
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
                  final ticket = tickets[index] as Map<String, dynamic>;
                  final ticketId = ticket['id'] as int?;

                  return TicketCard(
                    ticket: ticket,
                    onTap: () {
                      if (ticketId != null) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => TicketDetailScreen(ticketId: ticketId),
                          ),
                        );
                      }
                    },
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
}