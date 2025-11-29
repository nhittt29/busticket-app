// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/home/home_bloc.dart';
import '../bloc/home/home_event.dart';
import '../bloc/home/home_state.dart';
import '../bloc/notification/notification_bloc.dart';        
import '../bloc/notification/notification_event.dart';       
import '../bloc/notification/notification_state.dart';      
import '../booking/screens/search_screen.dart';
import 'package:badges/badges.dart' as badges;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HomeBloc>().add(LoadUserEvent());
      context.read<NotificationBloc>().add(LoadNotificationsEvent());
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onItemTapped(int index) {
    setState(() => _selectedIndex = index);
    switch (index) {
      case 0:
        break;
      case 1:
        Navigator.pushNamed(context, '/my-tickets').then((_) {
          if (mounted && _selectedIndex != 0) {
            setState(() => _selectedIndex = 0);
          }
        });
        break;
      case 2:
        Navigator.pushNamed(context, '/notifications').then((_) {
          if (mounted) {
            setState(() => _selectedIndex = 0);
            context.read<NotificationBloc>().add(MarkAllAsReadEvent());
          }
        });
        break;
      case 3:
        Navigator.pushNamed(context, '/profile').then((_) {
          if (mounted && _selectedIndex != 0) {
            setState(() => _selectedIndex = 0);
          }
        });
        break;
    }
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 8,
          backgroundColor: Colors.white,
          child: Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.logout, size: 48, color: Colors.redAccent),
                const SizedBox(height: 16),
                const Text(
                  "Bạn có chắc chắn muốn đăng xuất?",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.grey[300],
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text("Hủy", style: TextStyle(color: Colors.black87)),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        context.read<HomeBloc>().add(LogoutEvent());
                        Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text("Xác nhận", style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> busFeatures = [
      {"icon": Icons.search, "label": "Tìm chuyến", "route": "/search-trips"},
      {"icon": Icons.confirmation_number, "label": "Vé của tôi", "route": "/my-tickets"},
      {"icon": Icons.explore, "label": "Khám phá", "route": "/explore-trips"},
      {"icon": Icons.directions_bus, "label": "Xe buýt", "route": "/buses"},
      {"icon": Icons.route, "label": "Tuyến đường", "route": "/routes"},
      {"icon": Icons.schedule, "label": "Lịch trình", "route": "/schedules"},
      {"icon": Icons.payment, "label": "Thanh toán", "route": "/payment"},
    ];

    const Color primaryBlue = Color(0xFF6AB7F5);
    const Color accentBlue = Color(0xFF4A9EFF);
    const Color deepBlue = Color(0xFF1976D2);
    const Color pastelBlue = Color(0xFFA0D8F1);
    const Color bgLight = Color(0xFFEAF6FF);

    return PopScope(
      canPop: _selectedIndex == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _selectedIndex != 0) {
          setState(() => _selectedIndex = 0);
        }
      },
      child: Scaffold(
        backgroundColor: bgLight,
        appBar: AppBar(
          backgroundColor: bgLight,
          elevation: 0,
          centerTitle: true,
          title: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset('assets/images/bus_logo.png', height: 30),
              const SizedBox(width: 8),
              const Text("BusTicket", style: TextStyle(color: Color(0xFF023E8A), fontWeight: FontWeight.bold, fontSize: 24)),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout, color: Colors.redAccent),
              onPressed: _showLogoutDialog,
            ),
          ],
        ),
        body: BlocBuilder<HomeBloc, HomeState>(
          builder: (context, state) {
            if (state.loading) return const Center(child: CircularProgressIndicator());

            return Column(
              children: [
                // BANNER
                Container(
                  width: double.infinity,
                  height: 180,
                  margin: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [primaryBlue, accentBlue],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: primaryBlue.withValues(alpha: 0.4), // SỬA deprecated → withValues
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        top: 16,
                        right: 16,
                        child: Image.asset('assets/images/bus_logo.png', height: 50),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'ĐẶT VÉ NHANH – GIÁ TỐT',
                              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'Hà Nội → TP.HCM từ 300k',
                              style: TextStyle(color: Colors.white, fontSize: 14),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen())),
                              icon: const Icon(Icons.search, size: 18),
                              label: const Text('Tìm ngay', style: TextStyle(fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: deepBlue,
                                elevation: 4,
                                shadowColor: Colors.black26,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // THANH TÌM KIẾM
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withValues(alpha: 0.15), // SỬA deprecated
                        blurRadius: 15,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: deepBlue),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'Hà Nội → TP.HCM',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.black87),
                            ),
                          ),
                          const Icon(Icons.swap_horiz, color: deepBlue),
                        ],
                      ),
                      const Divider(height: 24, thickness: 0.8, color: Color(0xFFE0E0E0)),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today, color: deepBlue),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'Hôm nay, 15/11/2025',
                              style: TextStyle(fontSize: 14, color: Colors.black54),
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen())),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primaryBlue,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                              elevation: 3,
                            ),
                            child: const Text('Tìm vé', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                          child: Text("Nhanh chóng", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                        ),
                        // ... (giữ nguyên toàn bộ phần PageView và các widget khác như cũ)
                        // (Không thay đổi gì ở đây để đảm bảo UI không bị ảnh hưởng)

                        // PHẦN NÀY GIỮ NGUYÊN NHƯ BẠN ĐÃ CÓ – CHỈ COPY LẠI ĐỂ ĐẦY ĐỦ
                        SizedBox(
                          height: 80,
                          child: PageView.builder(
                            controller: _pageController,
                            onPageChanged: (index) => setState(() => _currentPage = index),
                            itemCount: (busFeatures.length / 3).ceil(),
                            itemBuilder: (context, pageIndex) {
                              final start = pageIndex * 3;
                              final end = (start + 3 < busFeatures.length) ? start + 3 : busFeatures.length;
                              return Row(
                                children: List.generate(end - start, (i) {
                                  final item = busFeatures[start + i];
                                  return Expanded(
                                    child: GestureDetector(
                                      onTap: () => Navigator.pushNamed(context, item['route']),
                                      child: Container(
                                        margin: const EdgeInsets.symmetric(horizontal: 6),
                                        decoration: BoxDecoration(
                                          color: pastelBlue,
                                          borderRadius: BorderRadius.circular(16),
                                          border: Border.all(color: Colors.grey.shade300, width: 0.8),
                                          boxShadow: [
                                            BoxShadow(
                                              color: pastelBlue.withAlpha(80),
                                              blurRadius: 8,
                                              offset: const Offset(0, 4),
                                            )
                                          ],
                                        ),
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(6),
                                              decoration: BoxDecoration(
                                                color: Colors.white.withAlpha(77),
                                                shape: BoxShape.circle,
                                              ),
                                              child: Icon(item['icon'], color: deepBlue, size: 22),
                                            ),
                                            const SizedBox(height: 6),
                                            Text(
                                              item['label'],
                                              textAlign: TextAlign.center,
                                              style: const TextStyle(color: Colors.black87, fontSize: 10, fontWeight: FontWeight.w600),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                }),
                              );
                            },
                          ),
                        ),

                        const SizedBox(height: 20),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate((busFeatures.length / 3).ceil(), (index) => Container(
                              margin: const EdgeInsets.symmetric(horizontal: 3),
                              width: _currentPage == index ? 8 : 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: _currentPage == index ? pastelBlue : Colors.grey.shade400,
                                borderRadius: BorderRadius.circular(3),
                              ),
                            )),
                          ),
                        ),
                        const SizedBox(height: 20),

                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                          child: Text("Khám phá", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                        ),
                        const SizedBox(height: 16),
                        ...List.generate(2, (rowIndex) {
                          final start = rowIndex * 1 + 3;
                          if (start >= busFeatures.length) return const SizedBox.shrink();
                          final item = busFeatures[start];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: Row(
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () => Navigator.pushNamed(context, item['route']),
                                    child: Container(
                                      height: 70,
                                      decoration: BoxDecoration(
                                        color: pastelBlue,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(color: Colors.grey.shade300, width: 0.8),
                                        boxShadow: [
                                          BoxShadow(
                                            color: pastelBlue.withAlpha(80),
                                            blurRadius: 10,
                                            offset: const Offset(0, 5),
                                          )
                                        ],
                                      ),
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.all(8),
                                            decoration: BoxDecoration(color: Colors.white.withAlpha(77), shape: BoxShape.circle),
                                            child: Icon(item['icon'], color: deepBlue, size: 20),
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            item['label'],
                                            textAlign: TextAlign.center,
                                            style: const TextStyle(color: Colors.black87, fontSize: 10, fontWeight: FontWeight.w600),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ),

                // BOTTOM NAVIGATION BAR – BADGE REALTIME HOÀN HẢO
                BottomNavigationBar(
                  type: BottomNavigationBarType.fixed,
                  backgroundColor: Colors.white,
                  currentIndex: _selectedIndex,
                  onTap: _onItemTapped,
                  selectedItemColor: const Color(0xFF1976D2),
                  unselectedItemColor: Colors.grey,
                  elevation: 12,
                  items: [
                    const BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Trang chủ'),
                    const BottomNavigationBarItem(icon: Icon(Icons.confirmation_number), label: 'Vé của tôi'),
                    BottomNavigationBarItem(
                      icon: BlocBuilder<NotificationBloc, NotificationState>(
                        builder: (context, state) {
                          final count = state.unreadCount;
                          if (count <= 0) {
                            return const Icon(Icons.notifications_outlined);
                          }
                          return badges.Badge(
                            badgeContent: Text(
                              count > 99 ? '99+' : count.toString(),
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                            badgeStyle: const badges.BadgeStyle(badgeColor: Colors.red),
                            child: const Icon(Icons.notifications),
                          );
                        },
                      ),
                      label: 'Thông báo',
                    ),
                    const BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Tài khoản'),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}