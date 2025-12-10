// lib/ticket/widgets/ticket_card.dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../review/screens/write_review_screen.dart';

class TicketCard extends StatelessWidget {
  final Map<String, dynamic> ticket;
  final List<Map<String, dynamic>>? groupTickets;
  final VoidCallback onTap;
  final bool isHighlighted;

  const TicketCard({
    super.key,
    required this.ticket,
    this.groupTickets,
    required this.onTap,
    this.isHighlighted = false,
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
                    color: const Color(0xFF66BB6A).withValues(alpha: 0.3),
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
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 4),
              Row(
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
              const SizedBox(height: 4),
              // DISPLAY CREATED AT / BOOKING TIME
              Row(
                children: [
                  const Icon(Icons.access_time, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    _formatDate(ticket['createdAt']),
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ],
          ),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (ticket['status'] == 'PAID' || ticket['status'] == 'Đã thanh toán')
                const Icon(Icons.qr_code_scanner, color: Color(0xFF66BB6A)),
              Text(
                _status(ticket['status']),
                style: TextStyle(color: _color(ticket['status']), fontSize: 11),
              ),
              if (ticket['status'] == 'COMPLETED')
                InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => WriteReviewScreen(
                          ticketId: ticket['id'],
                          busId: ticket['schedule']['busId'],
                        ),
                      ),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.only(top: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.amber,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Đánh giá',
                      style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
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
                    margin: const EdgeInsets.only(top: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFA50064), // MoMo brand color
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Thanh toán ngay',
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

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr).toLocal(); // Convert to local time
      return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }
}