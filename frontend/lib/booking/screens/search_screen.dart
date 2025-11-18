// lib/booking/screens/search_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';

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
  void didChangeDependencies() {
    super.didChangeDependencies();
    final cubit = context.read<BookingCubit>();
    if (cubit.state.trips.isNotEmpty) {
      cubit.clearTrips();
    }
  }

  @override
  void dispose() {
    _fromController.dispose();
    _toController.dispose();
    super.dispose();
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
            Image.asset('assets/images/bus_logo.png', height: 36),
            const SizedBox(width: 12),
            const Text(
              "Tìm chuyến xe",
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: BlocListener<BookingCubit, BookingState>(
          listenWhen: (previous, current) =>
              previous.loading && !current.loading && current.trips.isNotEmpty && current.error == null,
          listener: (context, state) {
            Navigator.pushNamed(context, '/trip-list', arguments: state.trips);
          },
          child: BlocBuilder<BookingCubit, BookingState>(
            builder: (context, state) {
              // Hiển thị lỗi nếu có
              if (state.error != null && !state.loading) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(state.error!, style: const TextStyle(fontWeight: FontWeight.w600)),
                      backgroundColor: Colors.redAccent,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      margin: const EdgeInsets.all(16),
                    ),
                  );
                });
              }

              return Column(
                children: [
                  // Điểm đi
                  _buildTextField(
                    controller: _fromController,
                    label: 'Từ đâu',
                    icon: Icons.location_on,
                    hint: 'Nhập điểm đi (ví dụ: Hà Nội, Sài Gòn...)',
                  ),
                  const SizedBox(height: 18),

                  // Điểm đến
                  _buildTextField(
                    controller: _toController,
                    label: 'Đến đâu',
                    icon: Icons.location_on_outlined,
                    hint: 'Nhập điểm đến (ví dụ: Đà Nẵng, Nha Trang...)',
                  ),
                  const SizedBox(height: 18),

                  // Chọn ngày
                  _buildDatePicker(context, state),
                  const SizedBox(height: 40),

                  // Nút tìm chuyến
                  _buildSearchButton(context, state),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required String hint,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFA0D8F1).withOpacity(0.6), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.18),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(
            color: primaryBlue,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
          hintText: hint,
          hintStyle: TextStyle(color: Colors.grey[500], fontSize: 15),
          prefixIcon: Icon(icon, color: primaryBlue, size: 28),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          floatingLabelBehavior: FloatingLabelBehavior.always,
        ),
      ),
    );
  }

  Widget _buildDatePicker(BuildContext context, BookingState state) {
    final formattedDate =
        '${state.date.day.toString().padLeft(2, '0')}/${state.date.month.toString().padLeft(2, '0')}/${state.date.year}';

    return InkWell(
      borderRadius: BorderRadius.circular(20),
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
        if (date != null) {
          context.read<BookingCubit>().selectDate(date);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFA0D8F1).withOpacity(0.6), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.18),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_rounded, color: primaryBlue, size: 28),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Ngày đi',
                  style: TextStyle(
                    color: primaryBlue,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  formattedDate,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF023E8A),
                  ),
                ),
              ],
            ),
            const Spacer(),
            const Icon(Icons.keyboard_arrow_down_rounded, color: primaryBlue, size: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchButton(BuildContext context, BookingState state) {
    final bool canSearch = state.from.isNotEmpty && state.to.isNotEmpty;

    return SizedBox(
      width: double.infinity,
      height: 64,
      child: ElevatedButton.icon(
        onPressed: state.loading || !canSearch
            ? null
            : () {
                context.read<BookingCubit>().searchTrips();
              },
        icon: state.loading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
              )
            : const Icon(Icons.directions_bus_filled, size: 32),
        label: Text(
          state.loading ? 'Đang tìm chuyến...' : 'Tìm chuyến xe ngay',
          style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold, letterSpacing: 0.5),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGradientStart,
          disabledBackgroundColor: Colors.grey[400],
          foregroundColor: Colors.white,
          elevation: 12,
          shadowColor: primaryGradientStart.withOpacity(0.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
      ),
    );
  }
}