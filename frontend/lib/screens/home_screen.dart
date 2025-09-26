import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  final String email;

  const HomeScreen({super.key, required this.email});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Trang chính")),
      body: Center(
        child: Text("Xin chào, $email 👋",
            style: const TextStyle(fontSize: 20)),
      ),
    );
  }
}
