// lib/ticket/widgets/ticket_card.dart
import 'package:flutter/material.dart';

class TicketCard extends StatelessWidget {
  final dynamic ticket;
  final VoidCallback onTap;

  const TicketCard({super.key, required this.ticket, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: _getColor(ticket['status']),
          child: Text('#${ticket['id']}', style: const TextStyle(color: Colors.white, fontSize: 10)),
        ),
        title: Text('${ticket['schedule']['route']['startPoint']} to ${ticket['schedule']['route']['endPoint']}'),
        subtitle: Text('${ticket['seat']['code']} • ${_formatDate(ticket['schedule']['departureAt'])}'),
        trailing: Chip(
          label: Text(_getStatusText(ticket['status']), style: const TextStyle(fontSize: 10)),
          backgroundColor: _getColor(ticket['status']).withOpacity(0.2),
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
    final date = DateTime.parse(iso).toLocal();
    return '${date.day}/${date.month} ${date.hour}h${date.minute.toString().padLeft(2, '0')}';
  }
}