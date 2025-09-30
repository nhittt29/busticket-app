import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String email;
  const ResetPasswordScreen({super.key, required this.email});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  String newPassword = '';
  String confirmPassword = '';
  bool loading = false;

  Future<void> handleResetPassword() async {
    if (_formKey.currentState!.validate()) {
      setState(() => loading = true);
      try {
        await ApiService.resetPassword(widget.email, newPassword);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Đặt lại mật khẩu thành công")),
          );
          Navigator.pop(context);
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
      appBar: AppBar(title: const Text("Đặt lại mật khẩu")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              Text("Email: ${widget.email}"),
              const SizedBox(height: 12),
              TextFormField(
                decoration: const InputDecoration(labelText: "Mật khẩu mới"),
                obscureText: true,
                onChanged: (value) => newPassword = value,
                validator: (value) =>
                    value != null && value.length >= 8 ? null : "Mật khẩu ít nhất 8 ký tự",
              ),
              const SizedBox(height: 12),
              TextFormField(
                decoration: const InputDecoration(labelText: "Xác nhận mật khẩu"),
                obscureText: true,
                onChanged: (value) => confirmPassword = value,
                validator: (value) =>
                    value == newPassword ? null : "Mật khẩu không khớp",
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: loading ? null : handleResetPassword,
                child: loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Xác nhận"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
