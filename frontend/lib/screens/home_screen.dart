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
      appBar: AppBar(
        title: const Text("Trang chính"),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => handleLogout(context),
            tooltip: "Đăng xuất",
          ),
        ],
      ),
      body: Center(
        child: Text(
          "Xin chào, $email 👋",
          style: const TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}
