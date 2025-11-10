// lib/ticket/screens/ticket_qr_screen.dart
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import 'dart:typed_data';

class TicketQRScreen extends StatelessWidget {
  final String qrUrl;
  final Map<String, dynamic> ticket;

  const TicketQRScreen({
    super.key,
    required this.qrUrl,
    required this.ticket,
  });

  Future<void> _shareQR(BuildContext context) async {
    if (!context.mounted) return;

    try {
      final response = await http.get(Uri.parse(qrUrl));
      if (response.statusCode != 200) {
        if (context.mounted) {
          _showSnackBar(context, 'Không thể tải mã QR');
        }
        return;
      }

      final Uint8List bytes = response.bodyBytes;
      final tempDir = await getTemporaryDirectory();
      final file = File('${tempDir.path}/qr_ticket_${ticket['id']}.png');
      await file.writeAsBytes(bytes);

      if (!context.mounted) return;
      await Share.shareXFiles(
        [XFile(file.path)],
        text: 'Vé xe BusTicket #${ticket['id']}',
      );
    } catch (e) {
      if (context.mounted) {
        _showSnackBar(context, 'Chia sẻ thất bại');
      }
    }
  }

  Future<void> _saveQR(BuildContext context) async {
    if (!context.mounted) return;

    try {
      final response = await http.get(Uri.parse(qrUrl));
      if (response.statusCode != 200) {
        if (context.mounted) {
          _showSnackBar(context, 'Không thể tải mã QR');
        }
        return;
      }

      final Uint8List bytes = response.bodyBytes;
      final dir = await getExternalStorageDirectory();
      if (dir == null) {
        if (context.mounted) {
          _showSnackBar(context, 'Không thể truy cập bộ nhớ');
        }
        return;
      }

      final file = File('${dir.path}/BusTicket_QR_${ticket['id']}.png');
      await file.writeAsBytes(bytes);

      if (context.mounted) {
        _showSnackBar(context, 'Đã lưu vào ${file.path}');
      }
    } catch (e) {
      if (context.mounted) {
        _showSnackBar(context, 'Lưu thất bại');
      }
    }
  }

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString).toLocal();
      return '${date.day}/${date.month}/${date.year} lúc ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return 'Không rõ';
    }
  }

  @override
  Widget build(BuildContext context) {
    final schedule = ticket['schedule'] as Map<String, dynamic>?;
    final route = schedule?['route'] as Map<String, dynamic>?;
    final seat = ticket['seat'] as Map<String, dynamic>?;

    final startPoint = route?['startPoint']?.toString() ?? 'Không rõ';
    final endPoint = route?['endPoint']?.toString() ?? 'Không rõ';
    final departureAt = schedule?['departureAt']?.toString() ?? '';
    final seatCode = seat?['code']?.toString() ?? 'N/A';
    final ticketId = ticket['id']?.toString() ?? 'N/A';

    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF),
      appBar: AppBar(
        title: Text('QR Vé #$ticketId'),
        backgroundColor: const Color(0xFFEAF6FF),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () => _shareQR(context),
            tooltip: 'Chia sẻ',
          ),
          IconButton(
            icon: const Icon(Icons.download_outlined),
            onPressed: () => _saveQR(context),
            tooltip: 'Lưu ảnh',
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // QR Code
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    qrUrl,
                    width: 260,
                    height: 260,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return const Icon(Icons.qr_code, size: 260, color: Colors.grey);
                    },
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const SizedBox(
                        width: 260,
                        height: 260,
                        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                      );
                    },
                  ),
                ),
              ),

              const SizedBox(height: 20),
              const Text(
                'Quét mã QR để lên xe',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: Color(0xFF023E8A),
                ),
              ),
              const SizedBox(height: 24),

              // Thông tin vé
              Card(
                elevation: 3,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _info('Tuyến', '$startPoint to $endPoint'),
                      _info('Giờ đi', _formatDate(departureAt)),
                      _info('Ghế', seatCode),
                      _info('Vé #', ticketId),
                      _info(
                        'Trạng thái',
                        'Đã thanh toán',
                        color: const Color(0xFF66BB6A),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 32),
              Text(
                'Hiển thị mã này cho tài xế',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[700],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _info(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 15,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 15,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}