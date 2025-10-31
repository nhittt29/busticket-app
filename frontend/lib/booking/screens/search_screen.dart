// lib/booking/screens/search_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';

const Color greenSoft = Color(0xFF66BB6A);
const Color iconBlue = Color(0xFF1976D2);
const Color backgroundLight = Color(0xFFEAF6FF);

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _fromController = TextEditingController();
  final _toController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fromController.addListener(() {
      context.read<BookingCubit>().updateFrom(_fromController.text);
    });
    _toController.addListener(() {
      context.read<BookingCubit>().updateTo(_toController.text);
    });
  }

  @override
  void dispose() {
    _fromController.dispose();
    _toController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => BookingCubit(),
      child: Scaffold(
        backgroundColor: backgroundLight,
        appBar: AppBar(
          backgroundColor: backgroundLight,
          elevation: 0,
          centerTitle: true,
          title: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset('assets/images/bus_logo.png', height: 30),
              const SizedBox(width: 8),
              const Text("Tìm chuyến xe", style: TextStyle(color: Color(0xFF023E8A), fontWeight: FontWeight.bold, fontSize: 24)),
            ],
          ),
          leading: IconButton(icon: const Icon(Icons.arrow_back, color: iconBlue), onPressed: () => Navigator.pop(context)),
        ),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: BlocConsumer<BookingCubit, BookingState>(
            listener: (context, state) {
              if (state.error != null) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.error!)));
              }
              if (state.trips.isNotEmpty) {
                Navigator.pushNamed(context, '/trip-list', arguments: state.trips);
              }
            },
            builder: (context, state) {
              return Column(
                children: [
                  _buildTextField(_fromController, 'Từ', Icons.location_on),
                  const SizedBox(height: 16),
                  _buildTextField(_toController, 'Đến', Icons.location_on_outlined),
                  const SizedBox(height: 16),
                  _buildDatePicker(context, state),
                  const SizedBox(height: 32),
                  _buildSearchButton(context, state),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: iconBlue.withOpacity(0.3), width: 1.2),
        boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.15), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: iconBlue, fontWeight: FontWeight.w500),
          prefixIcon: Icon(icon, color: iconBlue),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        ),
      ),
    );
  }

  Widget _buildDatePicker(BuildContext context, BookingState state) {
    return InkWell(
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: state.date,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 30)),
          builder: (context, child) => Theme(data: ThemeData.light().copyWith(colorScheme: const ColorScheme.light(primary: greenSoft)), child: child!),
        );
        if (date != null) context.read<BookingCubit>().selectDate(date);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: iconBlue.withOpacity(0.3), width: 1.2),
          boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.15), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today, color: iconBlue),
            const SizedBox(width: 12),
            Text('${state.date.day}/${state.date.month}/${state.date.year}', style: const TextStyle(fontSize: 16)),
            const Spacer(),
            const Icon(Icons.keyboard_arrow_down, color: iconBlue),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchButton(BuildContext context, BookingState state) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: state.loading ? null : () => context.read<BookingCubit>().searchTrips(),
        icon: state.loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Icon(Icons.search, color: Colors.white),
        label: Text(state.loading ? 'Đang tìm...' : 'Tìm chuyến xe', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        style: ElevatedButton.styleFrom(
          backgroundColor: greenSoft,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 6,
          shadowColor: greenSoft.withOpacity(0.4),
        ),
      ),
    );
  }
}