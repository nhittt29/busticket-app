// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../bloc/home/home_bloc.dart';
import '../bloc/home/home_event.dart';
import '../bloc/home/home_state.dart';
import '../bloc/notification/notification_bloc.dart';        
import '../bloc/notification/notification_event.dart';       
import '../bloc/notification/notification_state.dart';      
import '../booking/screens/search_screen.dart';
import '../ticket/screens/ticket_detail_screen.dart';
import 'package:badges/badges.dart' as badges;

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HomeBloc>().add(LoadUserEvent());
      context.read<HomeBloc>().add(LoadHomeDataEvent()); // Load thêm data mới
      context.read<NotificationBloc>().add(LoadNotificationsEvent());
    });
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
        // AppBar tùy biến để hiển thị Xin chào
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: _buildCustomAppBar(),
        ),
        body: BlocBuilder<HomeBloc, HomeState>(
          builder: (context, state) {
            if (state.loading && state.user == null) {
              return const Center(child: CircularProgressIndicator());
            }

            return RefreshIndicator(
              onRefresh: () async {
                 context.read<HomeBloc>().add(LoadHomeDataEvent());
                 context.read<NotificationBloc>().add(LoadNotificationsEvent());
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 30),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. CHUYẾN ĐI SẮP TỚI (NẾU CÓ)
                    if (state.upcomingTrip != null)
                      _buildUpcomingTripCard(state.upcomingTrip!),

                    // 2. KHUYẾN MÃI HOT
                    if (state.promotions != null && state.promotions!.isNotEmpty)
                      _buildPromotionSection(state.promotions!),

                    // 3. TÌM KIẾM
                    _buildSearchSection(),

                    // 4. CHỨC NĂNG NHANH (Grid gọn gàng hơn)
                    const Padding(
                      padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
                      child: Text("Tiện ích", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                    ),
                    _buildFeatureGrid(),

                    // 5. ĐIỂM ĐẾN PHỔ BIẾN
                    const Padding(
                      padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
                      child: Text("Điểm đến hàng đầu", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                    ),
                    _buildPopularDestinations(),
                  ],
                ),
              ),
            );
          },
        ),
        bottomNavigationBar: _buildBottomNavBar(),
      ),
    );
  }

  Widget _buildCustomAppBar() {
    return BlocBuilder<HomeBloc, HomeState>(
      builder: (context, state) {
        final userName = state.user?['name']?.toString() ?? 'Bạn';
        // Lấy avatar nếu có, chưa implement thì dùng icon
        
        return AppBar(
          backgroundColor: const Color(0xFFEAF6FF),
          elevation: 0,
          titleSpacing: 16,
          automaticallyImplyLeading: false,
          title: Row(
            children: [
              CircleAvatar(
                backgroundColor: Colors.blue.withOpacity(0.2),
                child: const Icon(Icons.person, color: Color(0xFF023E8A)),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Xin chào,",
                    style: TextStyle(fontSize: 13, color: Colors.black54),
                  ),
                  Text(
                    userName,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout, color: Colors.redAccent),
              onPressed: _showLogoutDialog,
            ),
          ],
        );
      },
    );
  }

  Widget _buildUpcomingTripCard(Map<String, dynamic> trip) {
    try {
      final route = trip['schedule']['route'];
      final start = route['startPoint'];
      final end = route['endPoint'];
      final date = DateTime.parse(trip['schedule']['departureAt']);
      final timeStr = DateFormat('HH:mm').format(date);
      final dateStr = DateFormat('dd/MM/yyyy').format(date);
      final ticketId = trip['id'];

      return Container(
        margin: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF023E8A), Color(0xFF0077B6)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
             BoxShadow(color: Colors.blue.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 4)),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
               Navigator.push(context, MaterialPageRoute(builder: (_) => TicketDetailScreen(ticketId: ticketId)));
            },
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "CHUYẾN ĐI SẮP TỚI",
                        style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white24,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text("Chi tiết >", style: TextStyle(color: Colors.white, fontSize: 11)),
                      )
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                           Text(start, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                           const SizedBox(height: 4),
                           Text(timeStr, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const Icon(Icons.arrow_forward, color: Colors.white54),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                           Text(end, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                           const SizedBox(height: 4),
                           Text(dateStr, style: const TextStyle(color: Colors.white70, fontSize: 14)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    } catch (e) {
      return const SizedBox.shrink();
    }
  }

  Widget _buildPromotionSection(List<Map<String, dynamic>> promotions) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text("Ưu đãi dành cho bạn", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
        ),
        SizedBox(
          height: 140,
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            scrollDirection: Axis.horizontal,
            itemCount: promotions.length,
            itemBuilder: (context, index) {
              final promo = promotions[index];
              final code = promo['code'] ?? '';
              final desc = promo['description'] ?? '';
              final val = promo['discountValue'];
              final type = promo['discountType'];
              
              String discountText = type == 'PERCENT' ? '$val%' : '${val/1000}k';

              return Container(
                width: 240,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 80,
                      decoration: const BoxDecoration(
                        color: Color(0xFFFFF0E6),
                        borderRadius: BorderRadius.only(topLeft: Radius.circular(12), bottomLeft: Radius.circular(12)),
                      ),
                      child: Column(
                         mainAxisAlignment: MainAxisAlignment.center,
                         children: [
                            const Text("GIẢM", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.orange)),
                            Text(discountText, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.deepOrange)),
                         ],
                      ),
                    ),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                             Text(code, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                             const SizedBox(height: 4),
                             Text(desc, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                             const SizedBox(height: 8),
                             InkWell(
                               onTap: () {
                                 // Copy code Logic or Apply
                                 ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Mã $code: $desc')));
                               },
                               child: const Text("Sao chép", style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 12)),
                             )
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSearchSection() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildSearchField(icon: Icons.my_location, hint: "Điểm đi (Hà Nội, TP.HCM...)", isTop: true),
          const Divider(height: 1, thickness: 1),
           _buildSearchField(icon: Icons.location_on, hint: "Điểm đến (Đà Lạt, Sapa...)"),
          const SizedBox(height: 16),
          Row(
            children: [
               Expanded(
                 child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    decoration: BoxDecoration(
                       color: Colors.grey[50],
                       borderRadius: BorderRadius.circular(12),
                       border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Row(
                       children: [
                          const Icon(Icons.calendar_today, size: 18, color: Colors.blue),
                          const SizedBox(width: 8),
                          Text("Ngày mai, ${DateFormat('dd/MM').format(DateTime.now().add(const Duration(days: 1)))}", 
                             style: const TextStyle(fontWeight: FontWeight.w600)),
                       ],
                    ),
                 ),
               ),
               const SizedBox(width: 12),
               ElevatedButton(
                 onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen())),
                 style: ElevatedButton.styleFrom(
                   backgroundColor: const Color(0xFF6AB7F5),
                   foregroundColor: Colors.white,
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                   padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                 ),
                 child: const Text("TÌM VÉ", style: TextStyle(fontWeight: FontWeight.bold)),
               ),
            ],
          ),
          
          // Gợi ý nhanh
          const SizedBox(height: 16),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
               children: [
                  _buildQuickLocChip("Nhà riêng", Icons.home),
                  _buildQuickLocChip("Cơ quan", Icons.work),
                  _buildQuickLocChip("Đà Lạt", Icons.favorite),
                  _buildQuickLocChip("Vũng Tàu", Icons.beach_access),
               ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildSearchField({required IconData icon, required String hint, bool isTop = false}) {
     return Padding(
       padding: const EdgeInsets.symmetric(vertical: 12),
       child: Row(
          children: [
             Icon(icon, color: Colors.grey),
             const SizedBox(width: 12),
             Expanded(
                child: Text(hint, style: const TextStyle(fontSize: 15, color: Colors.black54)),
             ),
          ],
       ),
     );
  }

  Widget _buildQuickLocChip(String label, IconData icon) {
     return Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
           color: Colors.grey[100],
           borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
           children: [
              Icon(icon, size: 14, color: Colors.grey[700]),
              const SizedBox(width: 4),
              Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[800], fontWeight: FontWeight.w500)),
           ],
        ),
     );
  }

  Widget _buildFeatureGrid() {
    final List<Map<String, dynamic>> features = [
      {"icon": Icons.search, "label": "Tìm chuyến", "route": "/search-trips", "color": Colors.blue},
      {"icon": Icons.confirmation_number, "label": "Vé của tôi", "route": "/my-tickets", "color": Colors.orange},
      {"icon": Icons.map, "label": "Tuyến đường", "route": "/routes", "color": Colors.green},
      {"icon": Icons.explore, "label": "Khám phá", "route": "/explore-trips", "color": Colors.purple},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
         mainAxisAlignment: MainAxisAlignment.spaceBetween,
         children: features.map((f) => _buildFeatureItem(f)).toList(),
      ),
    );
  }

  Widget _buildFeatureItem(Map<String, dynamic> item) {
     return GestureDetector(
        onTap: () => Navigator.pushNamed(context, item['route']),
        child: Column(
           children: [
              Container(
                 padding: const EdgeInsets.all(14),
                 decoration: BoxDecoration(
                    color: (item['color'] as Color).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                 ),
                 child: Icon(item['icon'], color: item['color'], size: 26),
              ),
              const SizedBox(height: 8),
              Text(item['label'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
           ],
        ),
     );
  }

  Widget _buildPopularDestinations() {
      final List<Map<String, String>> places = [
         {"name": "Đà Lạt", "image": "assets/images/dalat.png", "price": "250.000đ"}, 
         {"name": "Sapa", "image": "assets/images/sapa.png", "price": "300.000đ"},
         {"name": "Vũng Tàu", "image": "assets/images/vungtau.png", "price": "120.000đ"},
      ];
      
      return SizedBox(
         height: 180,
         child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: places.length,
            itemBuilder: (context, index) {
               return Container(
                  width: 140,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                     color: Colors.white,
                     borderRadius: BorderRadius.circular(16),
                     image: DecorationImage(
                        image: AssetImage(places[index]['image']!),
                        fit: BoxFit.cover,
                     ),
                     boxShadow: [
                       BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                       ),
                     ],
                  ),
                  child: Stack(
                     children: [
                        // Gradient Overlay để text dễ đọc
                        Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Colors.transparent, Colors.black.withValues(alpha: 0.7)],
                              stops: const [0.6, 1.0],
                            ),
                          ),
                        ),
                        Positioned(
                           bottom: 12, left: 12,
                           child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                 Text(places[index]['name']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                                 Container(
                                   margin: const EdgeInsets.only(top: 4),
                                   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                   decoration: BoxDecoration(
                                      color: Colors.orange,
                                      borderRadius: BorderRadius.circular(8),
                                   ),
                                   child: Text("Từ ${places[index]['price']}", style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                 ),
                              ],
                           ),
                        )
                     ],
                  ),
               );
            },
         ),
      );
  }

  Widget _buildBottomNavBar() {
    return BottomNavigationBar(
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
    );
  }
}