import 'package:flutter/material.dart';
import '../services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  String email = '';
  String password = '';
  String name = '';
  String phone = '';
  bool loading = false;

  Future<void> handleRegister() async {
    if (_formKey.currentState!.validate()) {
      setState(() => loading = true);
      try {
        final result = await ApiService.register(email, password, name, phone);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Đăng ký thành công: ${result['email']}')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.toString())),
          );
        }
      } finally {
        if (mounted) {
          setState(() => loading = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Đăng ký')),
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
                    value != null && value.length >= 12
                        ? null
                        : 'Mật khẩu tối thiểu 12 ký tự',
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Họ và tên'),
                onChanged: (value) => name = value,
                validator: (value) =>
                    value != null && value.isNotEmpty ? null : 'Bắt buộc',
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Số điện thoại'),
                onChanged: (value) => phone = value,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: loading ? null : handleRegister,
                child: loading
                    ? const CircularProgressIndicator()
                    : const Text('Đăng ký'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}