// lib/ticket/screens/cancel_ticket_dialog.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/ticket_cubit.dart';

class CancelTicketDialog extends StatelessWidget {
  final int ticketId;
  final int userId;

  const CancelTicketDialog({
    super.key,
    required this.ticketId,
    required this.userId,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Row(
        children: [
          Icon(Icons.warning_amber, color: Colors.orange, size: 28),
          SizedBox(width: 8),
          Text('Hủy vé', style: TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Bạn có chắc muốn hủy vé #${ticketId}?', style: const TextStyle(fontSize: 16)),
          const SizedBox(height: 8),
          Text(
            'Sau khi hủy, bạn sẽ không thể khôi phục.',
            style: TextStyle(color: Colors.grey[600], fontSize: 14),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Hủy bỏ', style: TextStyle(color: Colors.grey)),
        ),
        ElevatedButton(
          onPressed: () {
            context.read<TicketCubit>().cancelTicket(ticketId, userId);
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Đã hủy vé thành công!'),
                backgroundColor: Colors.green,
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          child: const Text('Hủy vé'),
        ),
      ],
    );
  }
}