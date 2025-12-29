// lib/booking/screens/search_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/booking_cubit.dart';
import '../cubit/booking_state.dart';
import '../widgets/trip_card.dart';
import '../widgets/filter_modal.dart';
import '../../theme/app_colors.dart';
import 'location_selection_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final ScrollController _scrollController = ScrollController();
  
  // Sorting & Filtering State
  String _selectedSort = 'price_asc';
  bool _hasActiveFilters = false;

  @override
  void initState() {
    super.initState();
    // Load initial data (Explore mode)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final cubit = context.read<BookingCubit>();
      cubit.loadLocations();
      // Only fetch if empty to avoid reload on back navigation
      if(cubit.state.trips.isEmpty) {
         cubit.searchTrips(); 
      }
    });

    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    context.read<BookingCubit>().resetSearch();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isBottom) {
      context.read<BookingCubit>().searchTrips(
        isLoadMore: true,
        sortBy: _selectedSort,
      );
    }
  }

  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    return currentScroll >= (maxScroll * 0.9);
  }

  void _onSortChanged(String sortValue) {
    if (_selectedSort == sortValue) return;
    setState(() => _selectedSort = sortValue);
    context.read<BookingCubit>().searchTrips(sortBy: sortValue);
  }

  void _showFilterModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FilterModal(
        onApply: ({minPrice, maxPrice, startTime, endTime, busType, brandId, dropoffPoint, sortBy}) {
          context.read<BookingCubit>().searchTrips(
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

  // SEARCH SELECTION HANDLERS
  Future<void> _selectStartPoint(BookingState state) async {
    final startPoints = state.routes.map((r) => r.startPoint).toSet().toList()..sort();
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => LocationSelectionScreen(
          title: 'Chọn điểm đi',
          locations: startPoints,
        ),
      ),
    );
    if (result != null && mounted) {
      context.read<BookingCubit>().updateFrom(result);
      // Auto clear invalid "To"
      final validEndPoints = state.routes
         .where((r) => r.startPoint == result)
         .map((r) => r.endPoint)
         .toSet();
      if (state.to.isNotEmpty && !validEndPoints.contains(state.to)) {
         context.read<BookingCubit>().updateTo('');
      }
      _triggerSearch();
    }
  }

  Future<void> _selectEndPoint(BookingState state) async {
    final List<String> endPoints;
    if (state.from.isNotEmpty) {
      endPoints = state.routes
          .where((r) => r.startPoint == state.from)
          .map((r) => r.endPoint)
          .toSet()
          .toList()..sort();
    } else {
      endPoints = state.routes.map((r) => r.endPoint).toSet().toList()..sort();
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
    if (result != null && mounted) {
      context.read<BookingCubit>().updateTo(result);
      _triggerSearch();
    }
  }

  Future<void> _selectDate(BookingState state) async {
    final date = await showDatePicker(
      context: context,
      initialDate: state.date,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
      builder: (context, child) => Theme(
        data: ThemeData.light().copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.primaryBlue),
        ),
        child: child!,
      ),
    );
    if (date != null && mounted) {
      context.read<BookingCubit>().selectDate(date);
      _triggerSearch();
    }
  }

  void _triggerSearch() {
    // Chỉ trigger search nếu cả 2 đã được chọn? 
    // Hoặc trigger luôn ở dạng Explore nếu chỉ chọn 1? 
    // Hiện tại backend hỗ trợ filter từng phần, nên cứ trigger.
    context.read<BookingCubit>().searchTrips(sortBy: _selectedSort);
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      onPopInvoked: (didPop) {
        if (didPop) {
           context.read<BookingCubit>().resetSearch();
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.backgroundLight,
        body: BlocBuilder<BookingCubit, BookingState>(
          builder: (context, state) {
            return CustomScrollView(
              controller: _scrollController,
              slivers: [
                _buildSliverAppBar(context, state),
                _buildFilterBar(),
                _buildTripList(state),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildSliverAppBar(BuildContext context, BookingState state) {
    final dateStr = '${state.date.day.toString().padLeft(2, '0')}/${state.date.month.toString().padLeft(2, '0')}';
    
    return SliverAppBar(
      expandedHeight: 220.0,
      floating: false,
      pinned: true,
      elevation: 0,
      backgroundColor: AppColors.primaryBlue,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.primaryBlue, AppColors.accentBlue],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Stack(
            children: [
               Positioned(
                 right: -20, top: -20,
                 child: Icon(Icons.directions_bus, size: 150, color: Colors.white.withOpacity(0.1)),
               ),
               Align(
                 alignment: Alignment.bottomLeft,
                 child: Padding(
                   padding: const EdgeInsets.fromLTRB(20, 20, 20, 90),
                   child: Column(
                     mainAxisSize: MainAxisSize.min,
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                       const Text(
                         "Bạn muốn đi đâu?",
                         style: TextStyle(color: Colors.white70, fontSize: 14),
                       ),
                       const SizedBox(height: 4),
                       Text(
                         state.from.isEmpty && state.to.isEmpty 
                             ? "Khám phá mọi nẻo đường" 
                             : "${state.from.isEmpty ? '...' : state.from} ➔ ${state.to.isEmpty ? '...' : state.to}",
                         style: const TextStyle(
                           color: Colors.white,
                           fontSize: 20,
                           fontWeight: FontWeight.bold,
                         ),
                         maxLines: 1, overflow: TextOverflow.ellipsis,
                       ),
                     ],
                   ),
                 ),
               )
            ],
          ),
        ),
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(70),
        child: Container(
          height: 70, // Height of the white search container
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          alignment: Alignment.bottomCenter,
          child: Container(
            height: 50,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 5)),
              ],
            ),
            child: Row(
              children: [
                // FROM
                Expanded(
                  flex: 3,
                  child: InkWell(
                    onTap: () => _selectStartPoint(state),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Row(
                        children: [
                           const Icon(Icons.my_location, color: Colors.blue, size: 18),
                           const SizedBox(width: 8),
                           Expanded(
                             child: Text(
                               state.from.isEmpty ? "Điểm đi" : state.from,
                               style: TextStyle(
                                 color: state.from.isEmpty ? Colors.grey : Colors.black87,
                                 fontWeight: FontWeight.w600,
                                 fontSize: 13
                               ),
                               overflow: TextOverflow.ellipsis,
                             ),
                           )
                        ],
                      ),
                    ),
                  ),
                ),
                Container(width: 1, height: 24, color: Colors.grey[300]),
                // TO
                Expanded(
                  flex: 3,
                  child: InkWell(
                    onTap: () => _selectEndPoint(state),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Row(
                        children: [
                           const Icon(Icons.location_on, color: Colors.redAccent, size: 18),
                           const SizedBox(width: 8),
                           Expanded(
                             child: Text(
                               state.to.isEmpty ? "Điểm đến" : state.to,
                               style: TextStyle(
                                 color: state.to.isEmpty ? Colors.grey : Colors.black87,
                                 fontWeight: FontWeight.w600,
                                 fontSize: 13
                               ),
                               overflow: TextOverflow.ellipsis,
                             ),
                           )
                        ],
                      ),
                    ),
                  ),
                ),
                Container(width: 1, height: 24, color: Colors.grey[300]),
                // DATE
                Expanded(
                  flex: 2,
                  child: InkWell(
                    onTap: () => _selectDate(state),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text("Ngày đi", style: TextStyle(fontSize: 10, color: Colors.grey[600])),
                          Text(
                            dateStr,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primaryBlue),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
      title: const Text('Đặt vé xe', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      centerTitle: true,
    );
  }

  Widget _buildFilterBar() {
    return SliverToBoxAdapter(
      child: Container(
        height: 60,
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            // Filter Button
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: InkWell(
                onTap: _showFilterModal,
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _hasActiveFilters ? AppColors.primaryBlue : Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: _hasActiveFilters ? AppColors.primaryBlue : Colors.grey.shade300),
                  ),
                  child: Icon(Icons.tune, size: 20, color: _hasActiveFilters ? Colors.white : Colors.grey[700]),
                ),
              ),
            ),
            
            // Sort Chips
            _buildChoiceChip('💰 Giá rẻ', 'price_asc'),
            const SizedBox(width: 8),
            _buildChoiceChip('⚡ Giá cao', 'price_desc'),
            const SizedBox(width: 8),
            _buildChoiceChip('🕒 Giờ sớm', 'time_asc'),
            const SizedBox(width: 8),
            _buildChoiceChip('🌙 Giờ muộn', 'time_desc'),
          ],
        ),
      ),
    );
  }

  Widget _buildChoiceChip(String label, String value) {
    final isSelected = _selectedSort == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => _onSortChanged(value),
      selectedColor: AppColors.pastelBlue,
      backgroundColor: Colors.white,
      labelStyle: TextStyle(
        color: isSelected ? AppColors.deepBlue : Colors.black87,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w400,
        fontSize: 13,
      ),
      side: BorderSide(color: isSelected ? AppColors.primaryBlue : Colors.transparent),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    );
  }

  Widget _buildTripList(BookingState state) {
    if (state.loading && state.trips.isEmpty) {
      return const SliverFillRemaining(
        child: Center(child: CircularProgressIndicator(color: AppColors.primaryBlue)),
      );
    }

    if (state.error != null && state.trips.isEmpty) {
      return SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.search_off, size: 60, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                state.error!,
                style: TextStyle(color: Colors.grey[600]), 
                textAlign: TextAlign.center
              ),
              TextButton(
                 onPressed: () => context.read<BookingCubit>().searchTrips(sortBy: _selectedSort),
                 child: const Text('Thử lại'),
              )
            ],
          ),
        ),
      );
    }

    if (state.trips.isEmpty) {
      return SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset('assets/images/bus_logo.png', height: 80, color: Colors.grey[300]),
              const SizedBox(height: 16),
              Text("Chưa tìm thấy chuyến xe nào", style: TextStyle(color: Colors.grey[500], fontSize: 16)),
            ],
          ),
        ),
      );
    }

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          if (index >= state.trips.length) {
            return state.hasReachedMax 
                ? const SizedBox(height: 80) // Bottom padding
                : const Center(child: CircularProgressIndicator());
          }
          final trip = state.trips[index];
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.08),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
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
        childCount: state.hasReachedMax ? state.trips.length : state.trips.length + 1,
      ),
    );
  }
}