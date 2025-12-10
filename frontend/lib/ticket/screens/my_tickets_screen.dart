// lib/ticket/screens/my_tickets_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../cubit/ticket_cubit.dart';
import '../cubit/ticket_state.dart';
import '../widgets/ticket_card.dart';
import 'ticket_detail_screen.dart';
import 'group_ticket_qr_screen.dart';

enum TicketFilter { all, upcoming, completed, cancelled }
enum SortOrder { newest, oldest }

class MyTicketsScreen extends StatefulWidget {
  const MyTicketsScreen({super.key});

  @override
  State<MyTicketsScreen> createState() => _MyTicketsScreenState();
}

class _MyTicketsScreenState extends State<MyTicketsScreen> {
  int? _highlightPaymentHistoryId;
  TicketFilter _selectedFilter = TicketFilter.all;
  SortOrder _sortOrder = SortOrder.newest; // Default: Mới nhất lên đầu

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    final int? paymentHistoryId = args is int ? args : null;

    if (paymentHistoryId != null && paymentHistoryId != _highlightPaymentHistoryId) {
      _highlightPaymentHistoryId = paymentHistoryId;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => GroupTicketQRScreen(paymentHistoryId: paymentHistoryId),
          ),
        ).then((_) {
          if (mounted) {
            setState(() => _highlightPaymentHistoryId = null);
          }
        });
      });
    }
  }

  // 2. Hàm hiển thị Dialog chọn Filter & Sort
  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true, // Cho phép cuộn nếu danh sách dài
      backgroundColor: const Color(0xFFF2F9FF), // Light blue tint to match theme
      elevation: 0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      margin: const EdgeInsets.only(top: 10, bottom: 20),
                      width: 40,
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.0),
                    child: Text(
                      'Sắp xếp (Theo ngày đặt)',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 10),
                  ListTile(
                    leading: const Icon(Icons.arrow_downward, color: Colors.blue),
                    title: const Text('Mới nhất trước'),
                    trailing: _sortOrder == SortOrder.newest ? const Icon(Icons.check, color: Colors.blue) : null,
                    onTap: () {
                      setState(() => _sortOrder = SortOrder.newest);
                      Navigator.pop(context);
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.arrow_upward, color: Colors.blue),
                    title: const Text('Cũ nhất trước'),
                    trailing: _sortOrder == SortOrder.oldest ? const Icon(Icons.check, color: Colors.blue) : null,
                    onTap: () {
                      setState(() => _sortOrder = SortOrder.oldest);
                      Navigator.pop(context);
                    },
                  ),
                  const Divider(thickness: 1, height: 30),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.0),
                    child: Text(
                      'Lọc theo trạng thái',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 10),
                  ListTile(
                    leading: const Icon(Icons.list_alt_rounded, color: Colors.blue),
                    title: const Text('Tất cả'),
                    trailing: _selectedFilter == TicketFilter.all ? const Icon(Icons.check, color: Colors.blue) : null,
                    onTap: () {
                      setState(() => _selectedFilter = TicketFilter.all);
                      Navigator.pop(context);
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.schedule_rounded, color: Colors.orange),
                    title: const Text('Sắp khởi hành'),
                    trailing: _selectedFilter == TicketFilter.upcoming ? const Icon(Icons.check, color: Colors.blue) : null,
                    onTap: () {
                      setState(() => _selectedFilter = TicketFilter.upcoming);
                      Navigator.pop(context);
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.history_rounded, color: Colors.green),
                    title: const Text('Đã hoàn thành / Qua ngày'),
                    trailing: _selectedFilter == TicketFilter.completed ? const Icon(Icons.check, color: Colors.blue) : null,
                    onTap: () {
                      setState(() => _selectedFilter = TicketFilter.completed);
                      Navigator.pop(context);
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.cancel_outlined, color: Colors.red),
                    title: const Text('Đã hủy'),
                    trailing: _selectedFilter == TicketFilter.cancelled ? const Icon(Icons.check, color: Colors.blue) : null,
                    onTap: () {
                      setState(() => _selectedFilter = TicketFilter.cancelled);
                      Navigator.pop(context);
                    },
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final userId = context.read<AuthBloc>().state.userId;

    if (userId == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFEAF6FF),
        appBar: AppBar(
          flexibleSpace: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF6AB7F5), Color(0xFF4A9EFF)],
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
            'Vé của tôi',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
        ),
        body: const Center(
          child: Text(
            'Vui lòng đăng nhập để xem vé của bạn',
            style: TextStyle(fontSize: 17, color: Colors.black54, fontWeight: FontWeight.w500),
          ),
        ),
      );
    }

    return BlocProvider(
      create: (_) => TicketCubit()..loadUserTickets(userId),
      child: Scaffold(
        backgroundColor: const Color(0xFFEAF6FF),
        appBar: AppBar(
          flexibleSpace: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF6AB7F5), Color(0xFF4A9EFF)],
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
            'Vé của tôi',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
          // 3. Add Filter Icon
          actions: [
            IconButton(
              icon: const Icon(Icons.filter_list_alt, color: Colors.white),
              onPressed: _showFilterDialog,
            ),
          ],
        ),
        body: BlocBuilder<TicketCubit, TicketState>(
          builder: (context, state) {
            if (state is TicketLoading) {
              return const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFF6AB7F5),
                  strokeWidth: 3.5,
                ),
              );
            }

            if (state is TicketError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 64, color: Colors.redAccent),
                    const SizedBox(height: 16),
                    Text(
                      'Lỗi tải dữ liệu',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.grey[800]),
                    ),
                    const SizedBox(height: 8),
                    Text(state.message, style: const TextStyle(color: Colors.black54)),
                  ],
                ),
              );
            }

            if (state is TicketLoaded) {
              final tickets = state.tickets;

              if (tickets.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.confirmation_number_outlined, size: 90, color: Colors.grey[400]),
                      const SizedBox(height: 24),
                      const Text(
                        'Bạn chưa có vé nào',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Đặt vé ngay để bắt đầu hành trình!',
                        style: TextStyle(fontSize: 16, color: Colors.black54),
                      ),
                      const SizedBox(height: 40),
                      ElevatedButton.icon(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.search, color: Colors.white),
                        label: const Text('Tìm chuyến xe', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6AB7F5),
                          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                          elevation: 8,
                        ),
                      ),
                    ],
                  ),
                );
              }

              // Nhóm vé theo paymentHistoryId
              final Map<int?, List<Map<String, dynamic>>> grouped = {};
              for (final t in tickets) {
                final phId = t['paymentHistoryId'] as int?;
                grouped.putIfAbsent(phId, () => []).add(t);
              }

              // Chuyển sang List và Sắp xếp
              final sortedGroups = grouped.values.toList();
              sortedGroups.sort((a, b) {
                // Sử dụng ngày đặt (createdAt) để sắp xếp thay vì ngày khởi hành
                final firstA = a.first;
                final firstB = b.first;

                final dateStrA = firstA['createdAt'] as String?;
                final dateStrB = firstB['createdAt'] as String?;

                final dateA = dateStrA != null ? DateTime.tryParse(dateStrA) : null;
                final dateB = dateStrB != null ? DateTime.tryParse(dateStrB) : null;

                if (dateA == null && dateB == null) return 0;
                if (dateA == null) return 1;
                if (dateB == null) return -1;

                // Sort theo selected SortOrder
                if (_sortOrder == SortOrder.newest) {
                  return dateB.compareTo(dateA); // Giảm dần
                } else {
                  return dateA.compareTo(dateB); // Tăng dần
                }
              });

              // 4. Implement Filter Logic
              final filteredGroups = sortedGroups.where((group) {
                if (_selectedFilter == TicketFilter.all) return true;

                final first = group.first;
                final status = first['status'];
                final schedule = first['schedule'];
                final dateStr = schedule?['departureTime'] as String?;
                final date = dateStr != null ? DateTime.tryParse(dateStr) : null;
                final now = DateTime.now();

                if (_selectedFilter == TicketFilter.cancelled) {
                  return status == 'CANCELLED';
                }

                if (_selectedFilter == TicketFilter.upcoming) {
                  // status != CANCELLED và chưa đi
                  return status != 'CANCELLED' && (date == null || date.isAfter(now));
                }

                if (_selectedFilter == TicketFilter.completed) {
                  // status == COMPLETED hoặc đã đi qua ngày
                  return status == 'COMPLETED' || (date != null && date.isBefore(now));
                }

                return true;
              }).toList();

              if (filteredGroups.isEmpty) {
                 return const Center(child: Text("Không có vé nào phù hợp bộ lọc.", style: TextStyle(fontSize: 16, color: Colors.grey)));
              }

              return RefreshIndicator(
                onRefresh: () async => context.read<TicketCubit>().loadUserTickets(userId),
                color: const Color(0xFF6AB7F5),
                backgroundColor: Colors.white,
                strokeWidth: 3,
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(18, 20, 18, 100), // thu hẹp margin
                  itemCount: filteredGroups.length,
                  itemBuilder: (context, index) {
                    final group = filteredGroups[index];
                    final first = group.first;
                    final phId = first['paymentHistoryId'] as int?;
                    final isGroup = group.length > 1;
                    // final highlighted = phId == _highlightPaymentHistoryId; // Đã bỏ highlight

                    return TicketCard(
                      ticket: first,
                      groupTickets: isGroup ? group : null,
                      isHighlighted: false, // Luôn tắt highlight
                      onTap: () {
                        if (phId != null) {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => GroupTicketQRScreen(paymentHistoryId: phId),
                            ),
                          );
                        } else {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => TicketDetailScreen(ticketId: first['id'] as int),
                            ),
                          );
                        }
                      },
                    );
                  },
                ),
              );
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }
}