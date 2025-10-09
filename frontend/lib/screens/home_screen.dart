import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  final String email;

  const HomeScreen({super.key, required this.email});

  void handleLogout(BuildContext context) {
    // ⚡ Ở đây nếu có token thì xóa token tại SharedPreferences trước
    Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFEAF6FF), Color(0xFFC9E4FB)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // AppBar với logo và nút đăng xuất
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Image.asset(
                      'assets/images/bus_logo.png',
                      height: 50, // Logo nhỏ hơn để phù hợp với AppBar
                    ),
                    IconButton(
                      icon: const Icon(Icons.logout, color: Colors.red),
                      onPressed: () => handleLogout(context),
                      tooltip: "Đăng xuất",
                    ),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 10),
                      Text(
                        "Xin chào 👋, $email",
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.blue.shade900,
                            ),
                      ),
                      const SizedBox(height: 20),
                      // Card lịch trình
                      Card(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          leading: const Icon(Icons.schedule, color: Color(0xFF0077B6)),
                          title: const Text("Xem lịch trình"),
                          subtitle: const Text("Kiểm tra các chuyến xe gần nhất"),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                          onTap: () {
                            // Điều hướng đến màn hình lịch trình
                          },
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Card đặt vé
                      Card(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          leading: const Icon(Icons.confirmation_number, color: Color(0xFF0077B6)),
                          title: const Text("Đặt vé ngay"),
                          subtitle: const Text("Đặt vé nhanh chóng và tiện lợi"),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                          onTap: () {
                            // Điều hướng đến màn hình đặt vé
                          },
                        ),
                      ),
                      const SizedBox(height: 12),
                      // Card thông báo
                      Card(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          leading: const Icon(Icons.notifications, color: Color(0xFF0077B6)),
                          title: const Text("Thông báo"),
                          subtitle: const Text("Cập nhật tin tức và ưu đãi"),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                          onTap: () {
                            // Điều hướng đến màn hình thông báo
                          },
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Nút đăng xuất
                      Center(
                        child: ElevatedButton.icon(
                          onPressed: () => handleLogout(context),
                          icon: const Icon(Icons.logout),
                          label: const Text("Đăng xuất"),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}