// lib/payment/screens/my_tickets_screen.dart
import 'package:flutter/material.dart';
import '../services/payment_api_service.dart';

const Color greenSoft = Color(0xFF66BB6A);
const Color iconBlue = Color(0xFF1976D2);
const Color backgroundLight = Color(0xFFEAF6FF);

class MyTicketsScreen extends StatefulWidget {
  const MyTicketsScreen({super.key});

  @override
  State<MyTicketsScreen> createState() => _MyTicketsScreenState();
}

class _MyTicketsScreenState extends State<MyTicketsScreen> {
  List<dynamic> tickets = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadTickets();
  }

  Future<void> _loadTickets() async {
    try {
      final data = await PaymentApiService.getUserTickets(1); // TODO: userId từ Auth
      setState(() {
        tickets = data;
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
    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        backgroundColor: backgroundLight,
        elevation: 0,
        title: const Text('Vé của tôi', style: TextStyle(color: Color(0xFF023E8A), fontWeight: FontWeight.bold)),
        leading: IconButton(icon: const Icon(Icons.arrow_back, color: iconBlue), onPressed: () => Navigator.pop(context)),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : tickets.isEmpty
              ? const Center(child: Text('Bạn chưa có vé nào', style: TextStyle(fontSize: 16)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: tickets.length,
                  itemBuilder: (context, index) {
                    final t = tickets[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        title: Text('Vé #${t['id']} - ${t['seat']['code']}'),
                        subtitle: Text('${t['schedule']['route']['startPoint']} to ${t['schedule']['route']['endPoint']}'),
                        trailing: Text(t['status'], style: TextStyle(color: t['status'] == 'PAID' ? Colors.green : Colors.orange)),
                        onTap: () => Navigator.pushNamed(context, '/ticket-qr', arguments: t['id']),
                      ),
                    );
                  },
                ),
    );
  }
}