import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'reset_password_screen.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  String email = '';
  bool loading = false;

  Future<void> handleForgotPassword() async {
    if (_formKey.currentState!.validate()) {
      setState(() => loading = true);
      try {
        await ApiService.forgotPassword(email);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Đã gửi email đặt lại mật khẩu")),
          );

          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ResetPasswordScreen(email: email),
            ),
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
      appBar: AppBar(title: const Text("Quên mật khẩu")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextFormField(
                decoration: const InputDecoration(labelText: "Email của bạn"),
                onChanged: (value) => email = value,
                validator: (value) =>
                    value != null && value.contains('@') ? null : "Email không hợp lệ",
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: loading ? null : handleForgotPassword,
                child: loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Gửi yêu cầu"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
