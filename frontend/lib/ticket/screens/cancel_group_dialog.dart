import 'package:flutter/material.dart';
import '../services/ticket_api_service.dart';

class CancelGroupDialog extends StatelessWidget {
  final List<int> ticketIds;

  const CancelGroupDialog({
    super.key,
    required this.ticketIds,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Row(
        children: [
          Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
          SizedBox(width: 8),
          Text('Hủy nhóm vé', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Bạn có chắc muốn hủy toàn bộ ${ticketIds.length} vé trong nhóm này không?', 
            style: TextStyle(color: Colors.grey[700], fontSize: 15)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.orange[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.orange.withAlpha(100)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline, size: 20, color: Colors.orange[800]),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Lưu ý: Vé đã thanh toán sẽ chịu phí hủy từ 10% - 30% tùy thời điểm. Tiền sẽ được hoàn sau 2-5 ngày.',
                    style: TextStyle(fontSize: 13, color: Colors.orange[900], height: 1.3),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text('Hành động này không thể hoàn tác.', 
            style: TextStyle(color: Colors.red[600], fontSize: 13, fontStyle: FontStyle.italic)),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Giữ lại', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w600)),
        ),
        ElevatedButton(
          onPressed: () async {
            Navigator.pop(context); // Đóng Confirm
            _showLoading(context);

            try {
              double totalRefund = 0;
              double totalFee = 0;
              int successCount = 0;

              // Loop cancel từng vé
              for (final id in ticketIds) {
                final res = await TicketApiService.cancelTicket(id);
                if (res['refundAmount'] != null) {
                   totalRefund += (res['refundAmount'] as num).toDouble();
                }
                if (res['feeAmount'] != null) {
                   totalFee += (res['feeAmount'] as num).toDouble();
                }
                successCount++;
              }

              if (context.mounted) {
                Navigator.pop(context); // Đóng Loading
                _showResultDialog(context, successCount, totalRefund, totalFee);
              }
            } catch (e) {
              if (context.mounted) {
                Navigator.pop(context); // Đóng Loading
                _showError(context, e.toString());
              }
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          child: const Text('Hủy tất cả', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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

  void _showResultDialog(BuildContext context, int count, double refund, double fee) {
    final formattedRefund = refund.toInt().toString().replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 28),
            SizedBox(width: 10),
            Text('Hủy thành công', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Đã hủy thành công $count vé.', style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            if (refund > 0)
               Text('Tổng tiền hoàn lại: ${formattedRefund}đ', 
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.green)),
            const SizedBox(height: 4),
            const Text('Vui lòng kiểm tra tài khoản nhận tiền hoàn sau 2-5 ngày làm việc.', 
                style: TextStyle(fontSize: 13, color: Colors.grey, fontStyle: FontStyle.italic)),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx); // Đóng Result
              Navigator.pop(context); // Back về danh sách
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Đóng', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showError(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text('Lỗi: ${message.split(':').last.trim()}')),
          ],
        ),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
}
