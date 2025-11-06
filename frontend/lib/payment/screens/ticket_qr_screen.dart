// lib/payment/screens/ticket_qr_screen.dart
import 'package:flutter/material.dart';
import '../services/payment_api_service.dart';

const Color greenSoft = Color(0xFF66BB6A);
const Color iconBlue = Color(0xFF1976D2);
const Color backgroundLight = Color(0xFFEAF6FF);

class TicketQRScreen extends StatefulWidget {
  const TicketQRScreen({super.key});

  @override
  State<TicketQRScreen> createState() => _TicketQRScreenState();
}

class _TicketQRScreenState extends State<TicketQRScreen> {
  Map<String, dynamic>? ticketData;
  bool loading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final ticketId = ModalRoute.of(context)!.settings.arguments as int;
    _loadTicket(ticketId);
  }

  Future<void> _loadTicket(int ticketId) async {
    try {
      final data = await PaymentApiService.getTicketById(ticketId);
      setState(() {
        ticketData = data;
        loading = false;
      });
    } catch (e) {
      setState(() => loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final qrCode = ticketData?['payment']?['qrCode'] ?? '';
    final seatCode = ticketData?['seat']?['code'] ?? 'N/A';
    final startPoint = ticketData?['schedule']?['route']?['startPoint'] ?? '';
    final endPoint = ticketData?['schedule']?['route']?['endPoint'] ?? '';
    final departure = DateTime.parse(ticketData?['schedule']?['departureAt']).toLocal().toString().substring(0, 16);

    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        backgroundColor: backgroundLight,
        elevation: 0,
        title: const Text('Vé của bạn', style: TextStyle(color: Color(0xFF023E8A), fontWeight: FontWeight.bold)),
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: iconBlue), onPressed: () => Navigator.pop(context)),
      ),
      body: Center(
        child: Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8)],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Mã vé: #${ticketData?['id']}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              if (qrCode.isNotEmpty)
                Image.network(qrCode, width: 200, height: 200)
              else
                const Icon(Icons.qr_code, size: 200, color: Colors.grey),
              const SizedBox(height: 16),
              _infoRow('Ghế', seatCode),
              _infoRow('Tuyến', '$startPoint to $endPoint'),
              _infoRow('Khởi hành', departure),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: greenSoft, padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16)),
                onPressed: () => Navigator.pushReplacementNamed(context, '/my-tickets'),
                child: const Text('Xem tất cả vé', style: TextStyle(fontSize: 16, color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
