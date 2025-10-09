import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  final String email;

  const HomeScreen({super.key, required this.email});

  void handleLogout(BuildContext context) {
    Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
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
            onPressed: () => handleLogout(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header chào người dùng với gradient và hiệu ứng
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
                    color: Colors.blue.shade100.withValues(alpha: 0.3), // Thay withOpacity bằng withValues
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 35,
                    backgroundColor: Colors.blue.shade100,
                    child: const Icon(Icons.person, size: 40, color: Colors.blue),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Xin chào 👋",
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
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
            // Tiêu đề chức năng
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
            // Grid chức năng với thiết kế hiện đại
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
                      // Navigator.pushNamed(context, item['route']);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            (item['color'] as Color).withValues(alpha: 0.8), // Thay withOpacity bằng withValues
                            (item['color'] as Color).withValues(alpha: 0.5), // Thay withOpacity bằng withValues
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: (item['color'] as Color).withValues(alpha: 0.2), // Thay withOpacity bằng withValues
                            blurRadius: 6,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            item['icon'] as IconData,
                            color: Colors.white,
                            size: 30,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            item['label'] as String,
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
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}