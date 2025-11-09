// lib/ticket/widgets/ticket_card.dart
import 'package:flutter/material.dart';

class TicketCard extends StatelessWidget {
  final Map<String, dynamic> ticket;
  final VoidCallback onTap;

  const TicketCard({
    super.key,
    required this.ticket,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final route = ticket['schedule']?['route'];
    final startPoint = route?['startPoint']?.toString() ?? 'Không rõ';
    final endPoint = route?['endPoint']?.toString() ?? 'Không rõ';
    final seatCode = ticket['seat']?['code']?.toString() ?? 'N/A';
    final departureAt = ticket['schedule']?['departureAt']?.toString() ?? '';
    final ticketId = ticket['id']?.toString() ?? '0';
    final status = ticket['status']?.toString() ?? 'UNKNOWN';
    final isPaid = status == 'PAID';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      elevation: 4,
      color: Colors.white, // Nền trắng nổi bật trên nền xanh nhạt
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: Color(0xFFE0E0E0), width: 1), // Viền nhẹ
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        onTap: onTap,
        leading: CircleAvatar(
          radius: 22,
          backgroundColor: _getStatusColor(status),
          child: Text(
            '#$ticketId',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          '$startPoint to $endPoint',
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 15,
            color: Color(0xFF023E8A), // Xanh đậm – hợp với logo
          ),
        ),
        subtitle: Text(
          '$seatCode • ${_formatDate(departureAt)}',
          style: TextStyle(
            color: Colors.grey[700],
            fontSize: 13,
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isPaid)
              const Padding(
                padding: EdgeInsets.only(right: 8),
                child: Icon(
                  Icons.qr_code,
                  color: Color(0xFF66BB6A),
                  size: 22,
                ),
              ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: _getStatusColor(status).withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _getStatusText(status),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: _getStatusColor(status),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PAID':
        return const Color(0xFF66BB6A); // Xanh lá
      case 'BOOKED':
        return const Color(0xFFFFA726); // Cam sáng
      case 'CANCELLED':
        return const Color(0xFFEF5350); // Đỏ tươi
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
    if (iso.isEmpty) return 'Không rõ';
    try {
      final date = DateTime.parse(iso).toLocal();
      return '${date.day}/${date.month} ${date.hour}h${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return 'Không rõ';
    }
  }
}