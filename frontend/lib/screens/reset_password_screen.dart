import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF),
      appBar: AppBar(
        title: const Text("Đặt lại mật khẩu"),
        backgroundColor: Colors.white,
        elevation: 2,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 0),
        child: BlocListener<AuthBloc, AuthState>(
          listener: (context, state) {
            if (state.error != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(state.error!)),
              );
            } else if (!state.isLoading && state.success && state.message == "Đặt lại mật khẩu thành công") {
              if (!mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Đặt lại mật khẩu thành công!")),
              );
              Future.delayed(const Duration(seconds: 1), () {
                if (mounted) {
                  Navigator.pushReplacementNamed(context, '/login');
                }
              });
            }
          },
          child: BlocBuilder<AuthBloc, AuthState>(
            buildWhen: (previous, current) => previous.isLoading != current.isLoading || previous.error != current.error || previous.success != current.success,
            builder: (context, state) {
              return Column(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Image.asset('assets/images/bus_logo.png', height: 300),
                  const SizedBox(height: 5),
                  const Text(
                    'BUSTICKET',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF023E8A),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Email: ${widget.email}',
                    style: const TextStyle(fontSize: 16, color: Colors.black87),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 5))],
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          TextFormField(
                            decoration: InputDecoration(
                              labelText: 'Mật khẩu mới',
                              prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF0077B6)),
                              filled: true,
                              fillColor: const Color(0xFFF7F9FB),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                            ),
                            obscureText: true,
                            style: const TextStyle(color: Colors.black),
                            onChanged: (value) => newPassword = value,
                            validator: (value) => value != null && value.length >= 8 ? null : 'Mật khẩu ít nhất 8 ký tự',
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            decoration: InputDecoration(
                              labelText: 'Xác nhận mật khẩu',
                              prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF0077B6)),
                              filled: true,
                              fillColor: const Color(0xFFF7F9FB),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                            ),
                            obscureText: true,
                            style: const TextStyle(color: Colors.black),
                            onChanged: (value) => confirmPassword = value,
                            validator: (value) => value == newPassword ? null : 'Mật khẩu không khớp',
                          ),
                          const SizedBox(height: 20),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0077B6),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              onPressed: state.isLoading
                                  ? null
                                  : () {
                                      if (_formKey.currentState!.validate()) {
                                        context.read<AuthBloc>().add(ResetPasswordEvent(widget.email, newPassword));
                                      }
                                    },
                              child: state.isLoading
                                  ? const CircularProgressIndicator(color: Colors.white)
                                  : const Text('Xác nhận', style: TextStyle(fontSize: 17, color: Colors.white)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Quay lại? ', style: TextStyle(color: Colors.black87)),
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Đăng nhập', style: TextStyle(color: Color(0xFF0077B6))),
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}