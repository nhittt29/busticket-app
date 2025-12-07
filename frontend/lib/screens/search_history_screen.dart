// lib/search/screens/search_history_screen.dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../booking/cubit/booking_cubit.dart';
import '../../booking/cubit/booking_cubit.dart';
import 'package:intl/intl.dart';

const Color primaryBlue = Color(0xFF6AB7F5);
const Color accentBlue = Color(0xFF4A9EFF);
const Color deepBlue = Color(0xFF1976D2);
const Color pastelBlue = Color(0xFFA0D8F1);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color successGreen = Color(0xFF4CAF50);

class SearchHistoryScreen extends StatefulWidget {
  const SearchHistoryScreen({super.key});

  @override
  State<SearchHistoryScreen> createState() => _SearchHistoryScreenState();
}

class _SearchHistoryScreenState extends State<SearchHistoryScreen> {
  List<Map<String, dynamic>> _history = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? historyJson = prefs.getString('search_history');

      if (historyJson == null) {
        if (mounted) setState(() => _isLoading = false);
        return;
      }

      final dynamic decoded = jsonDecode(historyJson);
      if (decoded is List) {
        setState(() {
          _history = List<Map<String, dynamic>>.from(
            decoded.map((x) => Map<String, dynamic>.from(x)),
          );
          _isLoading = false;
        });
      } else {
        await prefs.remove('search_history');
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint('Error loading history: $e');
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('search_history');
      } catch (_) {}
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _clearHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('search_history');
    setState(() {
      _history = [];
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Đã xóa toàn bộ lịch sử tìm kiếm', style: TextStyle(fontWeight: FontWeight.w600)),
          backgroundColor: successGreen,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _deleteItem(int index) async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _history.removeAt(index);
    });
    await prefs.setString('search_history', jsonEncode(_history));
  }

  Future<void> _repeatSearch(Map<String, dynamic> item) async {
    // 1. Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final cubit = context.read<BookingCubit>();
      
      // 2. Update parameters
      cubit.updateFrom(item['startPoint']);
      cubit.updateTo(item['endPoint']);
      
      try {
        final date = DateTime.parse(item['date']);
        cubit.selectDate(date);
      } catch (_) {}

      // 3. Perform search
      await cubit.searchTrips();
      
      if (!mounted) return;
      
      // 4. Hide loading
      Navigator.pop(context); 

      // 5. Navigate
      if (cubit.state.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(cubit.state.error!), backgroundColor: Colors.red),
        );
      } else {
        Navigator.pushNamed(context, '/trip-list', arguments: cubit.state.trips);
      }
    } catch (e) {
      if (mounted) Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [primaryBlue, accentBlue],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Lịch sử tìm kiếm',
          style: TextStyle(
            color: Colors.white,
            fontSize: 23,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
        actions: [
          if (_history.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep_rounded, color: Colors.white),
              tooltip: 'Xóa toàn bộ lịch sử',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    title: const Text("Xóa lịch sử tìm kiếm?", style: TextStyle(fontWeight: FontWeight.bold)),
                    content: const Text("Tất cả lịch sử sẽ bị xóa vĩnh viễn."),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text("Hủy", style: TextStyle(color: Colors.grey)),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _clearHistory();
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
                        child: const Text("Xóa", style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: primaryBlue, strokeWidth: 3))
          : _history.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: backgroundLight,
                            shape: BoxShape.circle,
                            border: Border.all(color: pastelBlue, width: 2),
                          ),
                          child: Icon(Icons.history_toggle_off_rounded, size: 80, color: Colors.grey[400]),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'Chưa có lịch sử',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey[700]),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Hành trình tìm kiếm của bạn sẽ xuất hiện tại đây',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
                  itemCount: _history.length,
                  itemBuilder: (context, index) {
                    final item = _history[index];
                    final dateStr = item['date'];
                    DateTime? tripDate;
                    try {
                      tripDate = DateTime.parse(dateStr);
                    } catch (_) {}
                    final displayTripDate = tripDate != null
                        ? DateFormat('dd/MM/yyyy').format(tripDate)
                        : dateStr;

                    // Calculate Group Header
                    final timestamp = item['timestamp'];
                    DateTime searchTime = DateTime.fromMillisecondsSinceEpoch(timestamp ?? DateTime.now().millisecondsSinceEpoch);
                    String header = "";
                    
                    if (index == 0) {
                      header = _getDateLabel(searchTime);
                    } else {
                      final prevItem = _history[index - 1];
                      final prevTime = DateTime.fromMillisecondsSinceEpoch(prevItem['timestamp'] ?? 0);
                      if (_getDateLabel(searchTime) != _getDateLabel(prevTime)) {
                         header = _getDateLabel(searchTime);
                      }
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (header.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 16, bottom: 12, left: 8),
                            child: Row(
                              children: [
                                const Icon(Icons.calendar_month_rounded, size: 18, color: primaryBlue),
                                const SizedBox(width: 8),
                                Text(
                                  header,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: primaryBlue,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        
                        // TIMELINE ITEM
                        IntrinsicHeight(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Timeline Line
                              Column(
                                children: [
                                  Container(
                                    margin: const EdgeInsets.only(top: 24),
                                    width: 12,
                                    height: 12,
                                    decoration: BoxDecoration(
                                      color: accentBlue,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2),
                                      boxShadow: [BoxShadow(color: accentBlue.withOpacity(0.4), blurRadius: 4)],
                                    ),
                                  ),
                                  Expanded(
                                    child: Container(
                                      width: 2,
                                      color: pastelBlue.withOpacity(0.5),
                                      margin: const EdgeInsets.symmetric(vertical: 4),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(width: 14),
                              
                              // Content Card
                              Expanded(
                                child: Dismissible(
                                  key: Key(item.toString() + index.toString()),
                                  direction: DismissDirection.endToStart,
                                  background: Container(
                                    margin: const EdgeInsets.only(bottom: 16),
                                    decoration: BoxDecoration(
                                      color: Colors.red[100],
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    alignment: Alignment.centerRight,
                                    padding: const EdgeInsets.only(right: 20),
                                    child: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 28),
                                  ),
                                  onDismissed: (_) => _deleteItem(index),
                                  child: Container(
                                    margin: const EdgeInsets.only(bottom: 16),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(20),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.blueGrey.withOpacity(0.08),
                                          blurRadius: 10,
                                          offset: const Offset(0, 4),
                                        ),
                                      ],
                                      border: Border.all(color: Colors.grey.withOpacity(0.1)),
                                    ),
                                    child: Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        borderRadius: BorderRadius.circular(20),
                                        onTap: () => _repeatSearch(item),
                                        child: Padding(
                                          padding: const EdgeInsets.all(16),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                children: [
                                                  Expanded(
                                                    child: Text(
                                                      "${item['startPoint']}  ➝  ${item['endPoint']}",
                                                      style: const TextStyle(
                                                        fontSize: 16,
                                                        fontWeight: FontWeight.bold,
                                                        color: Color(0xFF333333),
                                                      ),
                                                    ),
                                                  ),
                                                  Container(
                                                    padding: const EdgeInsets.all(6),
                                                    decoration: BoxDecoration(
                                                      color: backgroundLight,
                                                      borderRadius: BorderRadius.circular(8),
                                                    ),
                                                    child: const Icon(Icons.arrow_forward, size: 16, color: accentBlue),
                                                  )
                                                ],
                                              ),
                                              const SizedBox(height: 12),
                                              Row(
                                                children: [
                                                  _buildInfoTag(Icons.calendar_today_outlined, displayTripDate, Colors.orange),
                                                  const SizedBox(width: 12),
                                                  _buildInfoTag(
                                                    Icons.access_time_rounded, 
                                                    DateFormat('HH:mm').format(searchTime), 
                                                    Colors.purple
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    );
                  },
                ),
    );
  }

  Widget _buildInfoTag(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: color.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }

  String _getDateLabel(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final checkDate = DateTime(date.year, date.month, date.day);

    if (checkDate == today) {
      return "Hôm nay";
    } else if (checkDate == yesterday) {
      return "Hôm qua";
    } else {
      return DateFormat('dd/MM/yyyy').format(date);
    }
  }
}