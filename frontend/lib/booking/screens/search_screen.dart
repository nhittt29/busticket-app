// lib/booking/screens/search_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'location_selection_screen.dart';

const Color primaryBlue = Color(0xFF1976D2);
const Color primaryGradientStart = Color(0xFF6AB7F5);
const Color primaryGradientEnd = Color(0xFF4A9EFF);
const Color backgroundLight = Color(0xFFEAF6FF);

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {



  List<Map<String, dynamic>> _history = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
       context.read<BookingCubit>().loadLocations();
       _loadHistory();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final cubit = context.read<BookingCubit>();
    if (cubit.state.trips.isNotEmpty) {
      cubit.clearTrips();
    }
  }

  @override
  void dispose() {

    super.dispose();
  }

  Future<void> _loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final String? historyJson = prefs.getString('search_history');
    if (historyJson != null) {
      try {
        setState(() {
          _history = List<Map<String, dynamic>>.from(jsonDecode(historyJson));
        });
      } catch (_) {}
    }
  }

  Future<void> _saveToHistory(String from, String to, DateTime date) async {
    final prefs = await SharedPreferences.getInstance();
    List<Map<String, dynamic>> history = [];
    final String? historyJson = prefs.getString('search_history');
    if (historyJson != null) {
      try {
        history = List<Map<String, dynamic>>.from(jsonDecode(historyJson));
      } catch (_) {}
    }

    final entry = {
      'startPoint': from,
      'endPoint': to,
      'date': date.toIso8601String(),
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };

    // Remove duplicate if exists (optional, or just add to top)
    history.removeWhere((item) => 
      item['startPoint'] == from && 
      item['endPoint'] == to && 
      item['date'].toString().split('T')[0] == date.toIso8601String().split('T')[0]
    );

    // Add to top
    history.insert(0, entry);
    // Limit to 10 items
    if (history.length > 10) history = history.sublist(0, 10);

    await prefs.setString('search_history', jsonEncode(history));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [primaryGradientStart, primaryGradientEnd],
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
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset('assets/images/bus_logo.png', height: 32),
            const SizedBox(width: 10),
            const Text(
              "Tìm chuyến xe",
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(18),
        child: BlocListener<BookingCubit, BookingState>(
          listenWhen: (previous, current) =>
              previous.loading && !current.loading && current.trips.isNotEmpty && current.error == null,
          listener: (context, state) {
            Navigator.pushNamed(context, '/trip-list', arguments: state.trips);
          },
          child: BlocBuilder<BookingCubit, BookingState>(
            builder: (context, state) {
              if (state.error != null && !state.loading) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(state.error!, style: const TextStyle(fontWeight: FontWeight.w600)),
                      backgroundColor: Colors.redAccent,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      margin: const EdgeInsets.all(12),
                    ),
                  );
                });
              }

              return Column(
                children: [
                  // 1. FROM & TO SELECTION
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                         BoxShadow(
                            color: Colors.grey.withValues(alpha: 0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                         )
                      ],
                      border: Border.all(color: Colors.blue.withValues(alpha: 0.1)),
                    ),
                    child: Column(
                      children: [
                        // FROM
                        _buildLocationSelector(
                          context,
                          label: 'Điểm đi',
                          value: state.from.isEmpty ? 'Chọn điểm đi' : state.from,
                          icon: Icons.my_location,
                          isPlaceholder: state.from.isEmpty,
                          onTap: () async {
                             // 1. Get unique start points
                             final startPoints = state.routes
                                 .map((r) => r.startPoint)
                                 .toSet()
                                 .toList()..sort();

                             final result = await Navigator.push(
                               context,
                               MaterialPageRoute(
                                 builder: (_) => LocationSelectionScreen(
                                   title: 'Chọn điểm đi', 
                                   locations: startPoints, // Pass filtered list
                                 ),
                               ),
                             );
                             if (result != null && context.mounted) {
                               context.read<BookingCubit>().updateFrom(result);
                               // If current To is invalid for new From, clear it? 
                               // Or let user rediscover. Better to clear To if it's not in valid endpoints.
                               // Ideally we check if `to` is still valid.
                               final validEndPoints = state.routes
                                   .where((r) => r.startPoint == result)
                                   .map((r) => r.endPoint)
                                   .toSet();
                                   
                               if (state.to.isNotEmpty && !validEndPoints.contains(state.to)) {
                                  context.read<BookingCubit>().updateTo('');
                               }
                             }
                          },
                        ),
                        
                        const Divider(height: 1, thickness: 1),
                        
                        // TO
                        Stack(
                          alignment: Alignment.centerRight,
                          children: [
                             _buildLocationSelector(
                               context,
                               label: 'Điểm đến',
                               value: state.to.isEmpty ? 'Chọn điểm đến' : state.to,
                               icon: Icons.location_on,
                               isPlaceholder: state.to.isEmpty,
                               onTap: () async {
                                  // 2. Get end points based on From
                                  final List<String> endPoints;
                                  if (state.from.isNotEmpty) {
                                    endPoints = state.routes
                                        .where((r) => r.startPoint == state.from)
                                        .map((r) => r.endPoint)
                                        .toSet()
                                        .toList()..sort();
                                  } else {
                                    // If From is empty, show ALL unique end points
                                    endPoints = state.routes
                                        .map((r) => r.endPoint)
                                        .toSet()
                                        .toList()..sort();
                                      
                                    // Or maybe force user to select From first? 
                                    // User said "show correct points". Usually users pick From first.
                                    // But showing all supports "I want to go TO Da Lat from anywhere" flow.
                                  }

                                  final result = await Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => LocationSelectionScreen(
                                        title: 'Chọn điểm đến', 
                                        locations: endPoints,
                                      ),
                                    ),
                                  );
                                  if (result != null && context.mounted) {
                                    context.read<BookingCubit>().updateTo(result);
                                  }
                               },
                             ),
                             
                             // SWAP BUTTON
                             Padding(
                               padding: const EdgeInsets.only(right: 16),
                               child: CircleAvatar(
                                 backgroundColor: Colors.blue[50], 
                                 radius: 18,
                                 child: IconButton(
                                   icon: const Icon(Icons.swap_vert, size: 20, color: Colors.blue),
                                   onPressed: () {
                                     final currentFrom = state.from;
                                     final currentTo = state.to;
                                     context.read<BookingCubit>().updateFrom(currentTo);
                                     context.read<BookingCubit>().updateTo(currentFrom);
                                   },
                                 ),
                               ),
                             )
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  _buildDatePicker(context, state),
                  const SizedBox(height: 36),

                  _buildSearchButton(context, state),
                  
                  const SizedBox(height: 24),
                  _buildRecentSearches(),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildLocationSelector(
    BuildContext context, {
    required String label,
    required String value,
    required IconData icon,
    required bool isPlaceholder,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          children: [
            Icon(icon, color: Colors.blueAccent, size: 24),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                 Text(label, style: TextStyle(fontSize: 13, color: Colors.grey[600])),
                 const SizedBox(height: 4),
                 Text(
                   value, 
                   style: TextStyle(
                     fontSize: 16, 
                     fontWeight: FontWeight.w600,
                     color: isPlaceholder ? Colors.grey[400] : Colors.black87
                   )
                 ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildDatePicker(BuildContext context, BookingState state) {
    final formattedDate =
        '${state.date.day.toString().padLeft(2, '0')}/${state.date.month.toString().padLeft(2, '0')}/${state.date.year}';

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: state.date,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 60)),
          builder: (context, child) {
            return Theme(
              data: ThemeData.light().copyWith(
                colorScheme: const ColorScheme.light(
                  primary: primaryGradientStart,
                  onPrimary: Colors.white,
                  surface: Colors.white,
                ),
                textButtonTheme: TextButtonThemeData(
                  style: TextButton.styleFrom(foregroundColor: primaryBlue),
                ),
              ),
              child: child!,
            );
          },
        );
        if (date != null && context.mounted) {
          context.read<BookingCubit>().selectDate(date);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFA0D8F1).withValues(alpha: 0.7), width: 1.4),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withValues(alpha: 0.16),
              blurRadius: 12,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_rounded, color: primaryBlue, size: 26),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Ngày đi',
                  style: TextStyle(
                    color: primaryBlue,
                    fontWeight: FontWeight.bold,
                    fontSize: 14.5,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  formattedDate,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF023E8A),
                  ),
                ),
              ],
            ),
            const Spacer(),
            const Icon(Icons.keyboard_arrow_down_rounded, color: primaryBlue, size: 28),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchButton(BuildContext context, BookingState state) {
    final bool canSearch = state.from.isNotEmpty && state.to.isNotEmpty;

    return SizedBox(
      width: double.infinity,
      height: 58,
      child: ElevatedButton.icon(
        onPressed: state.loading || !canSearch
            ? null
            : () {
                _saveToHistory(state.from, state.to, state.date);
                context.read<BookingCubit>().searchTrips();
              },
        icon: state.loading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.8),
              )
            : const Icon(Icons.directions_bus_filled, size: 28),
        label: Text(
          state.loading ? 'Đang tìm...' : 'Tìm chuyến xe ngay',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 0.4),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGradientStart,
          disabledBackgroundColor: Colors.grey[400],
          foregroundColor: Colors.white,
          elevation: 10,
          shadowColor: primaryGradientStart.withValues(alpha: 0.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }


  Widget _buildRecentSearches() {
    if (_history.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          child: Text(
            "Tìm kiếm gần đây",
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.blueGrey),
          ),
        ),
        SizedBox(
          height: 50,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _history.length,
            itemBuilder: (context, index) {
              final item = _history[index];
              final from = item['startPoint'];
              final to = item['endPoint'];
              return GestureDetector(
                onTap: () {
                   context.read<BookingCubit>().updateFrom(from);
                   context.read<BookingCubit>().updateTo(to);
                },
                child: Container(
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  alignment: Alignment.center,
                  child: Row(
                    children: [
                      const Icon(Icons.history, size: 16, color: Colors.grey),
                      const SizedBox(width: 6),
                      Text("$from ➝ $to", style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black87, fontSize: 13)),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}