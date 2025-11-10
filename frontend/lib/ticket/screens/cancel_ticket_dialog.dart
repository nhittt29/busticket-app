// lib/ticket/screens/cancel_ticket_dialog.dart
import 'package:flutter/material.dart';
import '../services/ticket_api_service.dart';

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
          Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
          SizedBox(width: 8),
          Text('Xác nhận hủy vé', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Bạn có chắc muốn hủy vé này không?', style: TextStyle(color: Colors.grey[700], fontSize: 15)),
          const SizedBox(height: 8),
          Text('Vé #${ticketId.toString().padLeft(2, '0')}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 4),
          Text('Hành động này không thể hoàn tác.', style: TextStyle(color: Colors.red[600], fontSize: 13)),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Giữ lại', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w600)),
        ),
        ElevatedButton(
          onPressed: () async {
            Navigator.pop(context); // Đóng dialog
            _showLoading(context);

            try {
              await TicketApiService.cancelTicket(ticketId);
              if (context.mounted) {
                Navigator.pop(context); // Đóng loading
                _showSuccess(context);
              }
            } catch (e) {
              if (context.mounted) {
                Navigator.pop(context); // Đóng loading
                _showError(context, e.toString());
              }
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          child: const Text('Hủy vé', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  void _showLoading(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(child: CircularProgressIndicator(strokeWidth: 3)),
    );
  }

  void _showSuccess(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.white),
            SizedBox(width: 8),
            Text('Hủy vé thành công!'),
          ],
        ),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );

    Future.delayed(const Duration(seconds: 1), () {
      if (context.mounted) {
        Navigator.pop(context); // Quay lại danh sách vé
      }
    });
  }

  void _showError(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text('Hủy thất bại: ${message.split(':').last.trim()}')),
          ],
        ),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
}