import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
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
  @override
  void initState() {
    super.initState();

    // ✅ Đảm bảo gọi sau khi widget đã build xong
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HomeBloc>().add(LoadUserEvent());
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> features = [
      {"icon": Icons.search, "label": "Tìm chuyến xe", "color": Colors.blueAccent, "route": "/search-trips"},
      {"icon": Icons.confirmation_number, "label": "Vé của tôi", "color": Colors.teal, "route": "/my-tickets"},
      {"icon": Icons.payment, "label": "Thanh toán", "color": Colors.orangeAccent, "route": "/payment"},
      {"icon": Icons.feedback, "label": "Phản hồi", "color": Colors.purpleAccent, "route": "/feedback"},
      {"icon": Icons.support_agent, "label": "Hỗ trợ", "color": Colors.green, "route": "/support"},
      {"icon": Icons.directions_bus, "label": "Quản lý xe", "color": Colors.redAccent, "route": "/buses"},
      {"icon": Icons.alt_route, "label": "Tuyến đường", "color": Colors.indigo, "route": "/routes"},
      {"icon": Icons.calendar_month, "label": "Lịch trình", "color": Colors.cyan, "route": "/schedules"},
      {"icon": Icons.people, "label": "Người dùng", "color": Colors.brown, "route": "/users"},
      {"icon": Icons.bar_chart, "label": "Báo cáo", "color": Colors.amber, "route": "/reports"},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "BusTicket App",
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.bold,
            fontSize: 24,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.redAccent),
            onPressed: () {
              context.read<HomeBloc>().add(LogoutEvent());
              Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
            },
          ),
        ],
      ),
      body: BlocBuilder<HomeBloc, HomeState>(
        builder: (context, state) {
          if (state.loading) {
            return const Center(child: CircularProgressIndicator());
          }

          final user = state.user;
          final email = user?['email'] ?? '';
          final name = user?['name'] ?? '';
          String? avatarUrl = user?['avatar'];

          // ✅ Đảm bảo avatar có dạng URL đầy đủ
          if (avatarUrl != null && avatarUrl.isNotEmpty) {
            if (!avatarUrl.startsWith('http')) {
              avatarUrl = 'http://10.0.2.2:3000/${avatarUrl.replaceAll("\\", "/")}';
            }
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header user
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Colors.blue.shade50, Colors.white],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.blue.shade100.withValues(alpha: 0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 70,
                        height: 70,
                        child: ClipOval(
                          child: avatarUrl != null && avatarUrl.isNotEmpty
                              ? FadeInImage.assetNetwork(
                                  placeholder: 'assets/images/default.png',
                                  image: avatarUrl,
                                  fit: BoxFit.cover,
                                  imageErrorBuilder: (context, error, stackTrace) {
                                    if (kDebugMode) {
                                      print('Avatar load error: $error');
                                    }
                                    return Image.asset(
                                      'assets/images/default.png',
                                      fit: BoxFit.cover,
                                    );
                                  },
                                )
                              : Image.asset(
                                  'assets/images/default.png',
                                  fit: BoxFit.cover,
                                ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name.isNotEmpty ? "Xin chào 👋, $name" : "Xin chào 👋",
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue,
                              ),
                            ),
                            if (email.isNotEmpty)
                              Text(
                                email,
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8),
                  child: Text(
                    "Khám phá tính năng",
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                ),
                const SizedBox(height: 15),

                // Grid Feature
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.shade200,
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: GridView.builder(
                    itemCount: features.length,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      mainAxisSpacing: 15,
                      crossAxisSpacing: 10,
                      childAspectRatio: 1.0,
                    ),
                    itemBuilder: (context, index) {
                      final item = features[index];
                      return GestureDetector(
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text("Chuyển đến: ${item['label']}"),
                              duration: const Duration(seconds: 1),
                            ),
                          );
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                (item['color'] as Color).withValues(alpha: 0.8),
                                (item['color'] as Color).withValues(alpha: 0.5),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: (item['color'] as Color).withValues(alpha: 0.2),
                                blurRadius: 6,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(item['icon'], color: Colors.white, size: 30),
                              const SizedBox(height: 8),
                              Text(
                                item['label'],
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}