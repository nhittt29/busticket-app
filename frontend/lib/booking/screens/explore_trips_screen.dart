// lib/booking/screens/explore_trips_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';
import '../widgets/trip_card.dart';
import '../widgets/filter_modal.dart';
import '../../theme/app_colors.dart';




class ExploreTripsScreen extends StatefulWidget {
  const ExploreTripsScreen({super.key});

  @override
  State<ExploreTripsScreen> createState() => _ExploreTripsScreenState();
}

class _ExploreTripsScreenState extends State<ExploreTripsScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    context.read<BookingCubit>().fetchAllSchedules();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isBottom) {
      context.read<BookingCubit>().fetchAllSchedules(
        sortBy: _selectedSort, 
        isLoadMore: true,
      );
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }


  String _selectedSort = 'price_asc'; // Default sort
  bool _hasActiveFilters = false;


  void _onSortChanged(String sortValue) {
    if (_selectedSort == sortValue) return;
    setState(() => _selectedSort = sortValue);
    context.read<BookingCubit>().fetchAllSchedules(sortBy: sortValue);
  }

  Widget _buildSortChips() {
    final options = [
      {'label': '💰 Giá thấp nhất', 'value': 'price_asc'},
      {'label': '🕒 Giờ sớm nhất', 'value': 'departure_asc'},
      {'label': '⭐ Đánh giá cao', 'value': 'averageRating_desc'},
    ];

    return Container(
      height: 50,
      margin: const EdgeInsets.symmetric(vertical: 12),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: options.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final option = options[index];
          final isActive = _selectedSort == option['value'];
          return ChoiceChip(
            label: Text(
              option['label']!,
              style: TextStyle(
                color: isActive ? Colors.white : Colors.black87,
                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
              ),
            ),
            selected: isActive,
            selectedColor: AppColors.primaryBlue,
            backgroundColor: Colors.white,
            side: BorderSide(
              color: isActive ? AppColors.primaryBlue : Colors.grey.withAlpha(50),
            ),
            onSelected: (_) => _onSortChanged(option['value']!),
          );
        },
      ),
    );
  }

  void _showFilterModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FilterModal(
        onApply: ({
          minPrice,
          maxPrice,
          startTime,
          endTime,
          busType,
          brandId,
          dropoffPoint,
          sortBy,
        }) {
          context.read<BookingCubit>().fetchAllSchedules(
                minPrice: minPrice,
                maxPrice: maxPrice,
                startTime: startTime,
                endTime: endTime,
                busType: busType,
                brandId: brandId,
                dropoffPoint: dropoffPoint,
                sortBy: sortBy,
              );

          setState(() {
            _hasActiveFilters = minPrice != null ||
                maxPrice != null ||
                startTime != null ||
                endTime != null ||
                busType != null ||
                brandId != null ||
                dropoffPoint != null;
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,

      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.primaryBlue, AppColors.accentBlue],

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
          "Lọc theo chuyến đi",
          style: TextStyle(
            color: Colors.white,
            fontSize: 23,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
        actions: [
          IconButton(
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.filter_list_rounded, color: Colors.white, size: 28),
                if (_hasActiveFilters)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: _showFilterModal,
            tooltip: "Lọc chuyến xe",
          ),
        ],

      ),
      body: Column(
        children: [
          _buildSortChips(),
          Expanded(
            child: BlocBuilder<BookingCubit, BookingState>(
              builder: (context, state) {
                // Loading
                if (state.loading) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.primaryBlue, strokeWidth: 3),
                  );
                }

          // Error
          if (state.error != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline_rounded, size: 80, color: Colors.red.shade400),
                    const SizedBox(height: 20),
                    Text(
                      'Đã có lỗi xảy ra',
                      style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: Colors.grey[800]),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      state.error!,
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 15, color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () => context.read<BookingCubit>().fetchAllSchedules(),
                      icon: const Icon(Icons.refresh),
                      label: const Text('Thử lại', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryBlue,

                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          // Empty state
          if (state.trips.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.directions_bus_rounded,
                      size: 100,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Không tìm thấy chuyến xe nào',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Hãy thử thay đổi bộ lọc hoặc tìm vào thời điểm khác',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            );
          }

          // Danh sách chuyến xe – ĐẸP, GỌN, CHUYÊN NGHIỆP
          return RefreshIndicator(
            onRefresh: () async => context.read<BookingCubit>().fetchAllSchedules(),
            color: AppColors.primaryBlue,

            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 100), 
              itemCount: state.hasReachedMax 
                  ? state.trips.length 
                  : state.trips.length + 1,
              itemBuilder: (context, index) {
                if (index >= state.trips.length) {
                   return const Center(
                     child: Padding(
                       padding: EdgeInsets.all(16.0),
                       child: SizedBox(
                         width: 24, height: 24,
                         child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryBlue),
                       ),
                     ),
                   );
                }
                final trip = state.trips[index];
                return Container(

                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppColors.pastelBlue.withAlpha(120), width: 1.3),

                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withAlpha(60),
                        blurRadius: 14,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: TripCard(
                    trip: trip,
                    onTap: () {
                      context.read<BookingCubit>().selectTrip(trip);
                      Navigator.pushNamed(context, '/select-bus', arguments: trip.id);
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
          ),
        ],
      ),
    );
  }
}