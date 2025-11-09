// lib/ticket/screens/ticket_qr_screen.dart
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import '../../main.dart';

class TicketQRScreen extends StatelessWidget {
  final String qrUrl;
  final dynamic ticket;

  const TicketQRScreen({super.key, required this.qrUrl, required this.ticket});

  Future<void> _shareQR() async {
    final bytes = await http.readBytes(Uri.parse(qrUrl));
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/qr_ticket_${ticket['id']}.png');
    await file.writeAsBytes(bytes);
    await Share.shareXFiles([XFile(file.path)], text: 'Vé xe BusTicket #${ticket['id']}');
  }

  Future<void> _saveQR() async {
    final bytes = await http.readBytes(Uri.parse(qrUrl));
    final dir = await getExternalStorageDirectory();
    final file = File('${dir!.path}/BusTicket_QR_${ticket['id']}.png');
    await file.writeAsBytes(bytes);
    ScaffoldMessenger.of(MyApp.navigatorKey.currentContext!).showSnackBar(
      SnackBar(content: Text('Đã lưu vào ${file.path}')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final departure = DateTime.parse(ticket['schedule']['departureAt']).toLocal();

    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF), // ĐÃ ĐỒNG BỘ
      appBar: AppBar(
        title: Text('QR Vé #${ticket['id']}'),
        backgroundColor: const Color(0xFFEAF6FF),
        actions: [
          IconButton(icon: const Icon(Icons.share), onPressed: _shareQR),
          IconButton(icon: const Icon(Icons.download), onPressed: _saveQR),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Image.network(qrUrl, width: 280, height: 280),
              const SizedBox(height: 16),
              const Text('Quét mã QR để lên xe', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _info('Tuyến', '${ticket['schedule']['route']['startPoint']} to ${ticket['schedule']['route']['endPoint']}'),
                      _info('Giờ đi', departure.toString().substring(0, 16).replaceAll(' ', ' lúc ')),
                      _info('Ghế', ticket['seat']['code']),
                      _info('Trạng thái', 'Đã thanh toán', color: const Color(0xFF66BB6A)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _info(String label, String value, {Color? color}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: TextStyle(color: Colors.grey[600])),
            Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      );
}