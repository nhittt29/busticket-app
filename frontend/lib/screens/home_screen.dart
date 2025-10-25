import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/home/home_bloc.dart';
import '../bloc/home/home_event.dart';
import '../bloc/home/home_state.dart';

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
      case 0: break;
      case 1: Navigator.pushNamed(context, '/my-tickets'); break;
      case 2: Navigator.pushNamed(context, '/profile'); break;
    }
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 8,
          backgroundColor: Colors.white, // Background màu trắng
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
                      onPressed: () {
                        Navigator.of(context).pop(); // Đóng dialog
                      },
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
      {"icon": Icons.directions_bus, "label": "Xe buýt", "route": "/buses"},
      {"icon": Icons.route, "label": "Tuyến đường", "route": "/routes"},
      {"icon": Icons.schedule, "label": "Lịch trình", "route": "/schedules"},
      {"icon": Icons.payment, "label": "Thanh toán", "route": "/payment"},
    ];

    // ✅ MÀU XANH ĐẬM HƠN: 0xFF1976D2 (Muted Blue)
    const Color mutedBlue = Color(0xFF1976D2);

    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF),
      appBar: AppBar(
        backgroundColor: const Color(0xFFEAF6FF),
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
              // HERO BANNER - SOLID MUTED BLUE
              Container(
                width: double.infinity,
                height: 180,
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: mutedBlue,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: mutedBlue.withOpacity(0.2), blurRadius: 15, offset: const Offset(0, 8))],
                ),
                child: Stack(
                  children: [
                    Positioned(top: 20, right: 20, child: Image.asset('assets/images/bus_logo.png', height: 60)),
                    Positioned(
                      left: 20,
                      top: 30,
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('ĐẶT VÉ XE NHANH CHÓNG', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        const Text('Hà Nội - TP.HCM chỉ từ 300k', style: TextStyle(color: Colors.white, fontSize: 14)),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: 140,
                          child: ElevatedButton.icon(
                            onPressed: () => Navigator.pushNamed(context, '/search-trips'),
                            icon: Icon(Icons.search, size: 18, color: mutedBlue),
                            label: Text('Tìm vé', style: TextStyle(fontSize: 12, color: mutedBlue)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            ),
                          ),
                        ),
                      ]),
                    ),
                  ],
                ),
              ),

              // SEARCH BAR
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [
                  BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 2)),
                ]),
                child: Row(children: [
                  Icon(Icons.search, color: mutedBlue),
                  const SizedBox(width: 12),
                  const Expanded(child: Text('Từ: Hà Nội, Đến: TP.HCM, Ngày: Hôm nay', style: TextStyle(color: Colors.black54, fontSize: 14))),
                  ElevatedButton(
                    onPressed: () => Navigator.pushNamed(context, '/search-trips'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: mutedBlue,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Tìm', style: TextStyle(color: Colors.white, fontSize: 12)),
                  ),
                ]),
              ),

              const SizedBox(height: 20), // ✅ GIẢM: 32→20px (TẬN DỤNG KHOẢNG TRỐNG)

              // HORIZONTAL CAROUSEL
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 1. HORIZONTAL CAROUSEL
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        child: Text("Nhanh chóng", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                      ),
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
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(color: mutedBlue, width: 2),
                                        boxShadow: [BoxShadow(color: mutedBlue.withOpacity(0.15), blurRadius: 8, offset: const Offset(0, 4))],
                                      ),
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(item['icon'], color: mutedBlue, size: 24),
                                          const SizedBox(height: 6),
                                          Text(item['label'], textAlign: TextAlign.center, style: TextStyle(color: Colors.black87, fontSize: 10, fontWeight: FontWeight.w600)),
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
                      
                      // DOTS INDICATOR
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
                              color: _currentPage == index ? mutedBlue : Colors.grey, 
                              borderRadius: BorderRadius.circular(3)
                            ),
                          )),
                        ),
                      ),
                      const SizedBox(height: 20),
                      
                      // 2. STACKED ROWS - SOLID MUTED BLUE
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        child: Text("Khám phá", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                      ),
                      const SizedBox(height: 16),
                      ...List.generate(2, (rowIndex) {
                        final start = rowIndex * 1;
                        final end = (start + 1 < busFeatures.length - 3) ? start + 1 : busFeatures.length - 3;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Row(
                            children: List.generate(end - start, (i) {
                              final item = busFeatures[start + i + 3];
                              return Expanded(
                                child: GestureDetector(
                                  onTap: () => Navigator.pushNamed(context, item['route']),
                                  child: Container(
                                    height: 70,
                                    margin: const EdgeInsets.only(right: 8),
                                    decoration: BoxDecoration(
                                      color: mutedBlue,
                                      borderRadius: BorderRadius.circular(16),
                                      boxShadow: [BoxShadow(color: mutedBlue.withOpacity(0.15), blurRadius: 10, offset: const Offset(0, 5))],
                                    ),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.3), shape: BoxShape.circle),
                                          child: Icon(item['icon'], color: Colors.white, size: 20),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(item['label'], textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            }),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),

              // Bottom Navigation
              BottomNavigationBar(
                backgroundColor: Colors.white,
                currentIndex: _selectedIndex,
                onTap: _onItemTapped,
                selectedItemColor: mutedBlue,
                unselectedItemColor: Colors.grey,
                elevation: 8,
                items: const [
                  BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Trang chủ'),
                  BottomNavigationBarItem(icon: Icon(Icons.confirmation_number), label: 'Vé của tôi'),
                  BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Tài khoản'),
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}