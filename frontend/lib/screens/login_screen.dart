import 'package:flutter/material.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  String email = '';
  String password = '';
  bool loading = false;

  Future<void> handleLogin() async {
    if (_formKey.currentState!.validate()) {
      setState(() => loading = true);
      try {
        final result = await ApiService.login(email, password);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đăng nhập thành công')),
          );

          Navigator.pushReplacementNamed(
            context,
            '/home',
            arguments: {"email": result['email']},
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Lỗi: $e")),
          );
        }
      } finally {
        if (mounted) setState(() => loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đăng nhập')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                decoration: const InputDecoration(labelText: 'Email'),
                onChanged: (value) => email = value,
                validator: (value) =>
                    value != null && value.contains('@') ? null : 'Email không hợp lệ',
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Mật khẩu'),
                obscureText: true,
                onChanged: (value) => password = value,
                validator: (value) =>
                    value != null && value.length >= 6 ? null : 'Mật khẩu tối thiểu 6 ký tự',
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: loading ? null : handleLogin,
                child: loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Đăng nhập'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/register');
                },
                child: const Text("Chưa có tài khoản? Đăng ký"),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/forgot-password');
                },
                child: const Text("Quên mật khẩu?"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
