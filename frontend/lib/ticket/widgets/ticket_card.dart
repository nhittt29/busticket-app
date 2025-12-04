// lib/ticket/widgets/ticket_card.dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../review/screens/write_review_screen.dart';
import '../../review/models/review.dart';

class TicketCard extends StatelessWidget {
  final Map<String, dynamic> ticket;
  final List<Map<String, dynamic>>? groupTickets;
  final VoidCallback onTap;
  final bool isHighlighted;
  final int userId;

  const TicketCard({
    super.key,
    required this.ticket,
    this.groupTickets,
    required this.onTap,
    this.isHighlighted = false,
    required this.userId,
  });

  String _status(String? s) => s == 'PAID' || s == 'Đã thanh toán'
      ? 'Đã thanh toán'
      : s == 'BOOKED'
          ? 'Đang chờ'
          : 'Đã hủy';

  Color _color(String? s) => s == 'PAID' || s == 'Đã thanh toán'
      ? const Color(0xFF66BB6A)
      : s == 'BOOKED'
          ? Colors.orange
          : Colors.red;

  @override
  Widget build(BuildContext context) {
    final route = ticket['schedule']?['route'] ?? {};
    final start = route['startPoint'] ?? '—';
    final end = route['endPoint'] ?? '—';
    final isGroup = groupTickets != null && groupTickets!.length > 1;

    // HIỂN THỊ RÕ MÃ GHẾ CHO CẢ VÉ ĐƠN LẪN NHÓM
    late final String seatDisplay;
    if (isGroup) {
      final seats = groupTickets!
          .map((t) => t['seat']?['code']?.toString() ?? '')
          .where((s) => s.isNotEmpty)
          .toList();

      if (seats.isEmpty) {
        seatDisplay = '—';
      } else if (seats.length <= 3) {
        seatDisplay = seats.join(', ');
      } else {
        seatDisplay = '${seats.take(3).join(', ')}, ... (+${seats.length - 3})';
      }
    } else {
      seatDisplay = ticket['seat']?['code']?.toString() ?? '—';
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 500),
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: isHighlighted
            ? Border.all(color: const Color(0xFF66BB6A), width: 3)
            : null,
        boxShadow: isHighlighted
            ? [
                BoxShadow(
                    color: const Color(0xFF66BB6A).withOpacity(0.3),
                    blurRadius: 20)
              ]
            : null,
      ),
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: ListTile(
          onTap: onTap,
          leading: CircleAvatar(
            backgroundColor: _color(ticket['status']),
            child: Text('#${ticket['id']}',
                style: const TextStyle(color: Colors.white, fontSize: 11)),
          ),
          title: Text('$start → $end',
              style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Row(
            children: [
              const Icon(Icons.event_seat, size: 16, color: Color(0xFF66BB6A)),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  seatDisplay,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 2,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (ticket['status'] == 'PAID' || ticket['status'] == 'Đã thanh toán')
                const Icon(Icons.qr_code_scanner, color: Color(0xFF66BB6A), size: 18),
              Text(
                _status(ticket['status']),
                style: TextStyle(color: _color(ticket['status']), fontSize: 10),
              ),
              if (ticket['status'] == 'PAID' && ticket['schedule']?['status'] == 'COMPLETED')
                InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => WriteReviewScreen(
                          ticketId: ticket['id'],
                          userId: userId,
                          ticketData: ticket,
                        ),
                      ),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.only(top: 2),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: ticket['review'] != null ? Colors.blue : Colors.amber,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      ticket['review'] != null ? 'Sửa' : 'Đánh giá',
                      style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              if ((ticket['status'] == 'BOOKED' || ticket['status'] == 'Đang chờ') &&
                  ticket['paymentHistory']?['payUrl'] != null)
                InkWell(
                  onTap: () async {
                    final url = ticket['paymentHistory']!['payUrl'] as String;
                    final uri = Uri.parse(url);
                    try {
                      if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
                        await launchUrl(uri, mode: LaunchMode.platformDefault);
                      }
                    } catch (e) {
                      debugPrint('Could not launch payment URL: $e');
                    }
                  },
                  child: Container(
                    margin: const EdgeInsets.only(top: 2),
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFA50064), // MoMo brand color
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Thanh toán',
                      style: TextStyle(
                          fontSize: 10,
                          color: Colors.white,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}