import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';
import '../bloc/home/home_bloc.dart';
import '../bloc/home/home_event.dart' as home_event;
import 'home_screen.dart';
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';

final logger = Logger();

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool rememberMe = false;
  bool showPassword = false;

  @override
  void initState() {
    super.initState();
    _loadSavedCredentials();
  }

  Future<void> _loadSavedCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool('rememberMe') ?? false) {
      setState(() {
        rememberMe = true;
        _emailController.text = prefs.getString('savedEmail') ?? '';
        _passwordController.text = prefs.getString('savedPassword') ?? '';
      });
    }
  }

  Future<void> _saveCredentials() async {
    if (rememberMe) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('savedEmail', _emailController.text);
      await prefs.setString('savedPassword', _passwordController.text);
      await prefs.setBool('rememberMe', true);
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 50), // ✅ FIX: BỎ DẤU :
          child: BlocConsumer<AuthBloc, AuthState>(
            listener: (context, state) {
              if (state.error != null && state.error!.isNotEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      state.error!.replaceAll("Exception:", "").trim(),
                      style: const TextStyle(color: Colors.white),
                    ),
                    backgroundColor: Colors.redAccent,
                    duration: const Duration(seconds: 3),
                  ),
                );
              }
              if (state.success && state.message == "Đăng nhập thành công") {
                logger.i('✅ Login successful, navigating to HomeScreen');
                _saveCredentials(); // ✅ SỬ DỤNG _saveCredentials
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (_) => BlocProvider(
                      create: (_) => HomeBloc()..add(home_event.LoadUserEvent()),
                      child: const HomeScreen(),
                    ),
                  ),
                );
              }
            },
            builder: (context, state) {
              return AnimatedOpacity(
                opacity: state.isLoading ? 0.6 : 1.0,
                duration: const Duration(milliseconds: 300),
                child: AbsorbPointer(
                  absorbing: state.isLoading,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Image.asset('assets/images/bus_logo.png', height: 280),
                      const SizedBox(height: 8),
                      const Text(
                        'BUSTICKET',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF023E8A),
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Đặt vé xe nhanh chóng & tiện lợi',
                        style: TextStyle(fontSize: 15, color: Colors.black87),
                      ),
                      const SizedBox(height: 30),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Form(
                          key: _formKey, // ✅ SỬ DỤNG _formKey
                          child: Column(
                            children: [
                              TextFormField(
                                controller: _emailController,
                                decoration: InputDecoration(
                                  prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF0077B6)),
                                  hintText: 'Nhập email của bạn',
                                  filled: true,
                                  fillColor: const Color(0xFFF7F9FB),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14),
                                    borderSide: BorderSide.none,
                                  ),
                                ),
                                onChanged: (_) => setState(() {}),
                                validator: (v) {
                                  if (v == null || v.isEmpty) return 'Email không được để trống';
                                  if (!v.contains('@')) return 'Email không hợp lệ';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),
                              TextFormField(
                                controller: _passwordController,
                                decoration: InputDecoration(
                                  prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF0077B6)),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      showPassword ? Icons.visibility_off : Icons.visibility,
                                      color: const Color(0xFF0077B6),
                                    ),
                                    onPressed: () => setState(() => showPassword = !showPassword),
                                  ),
                                  hintText: 'Nhập mật khẩu',
                                  filled: true,
                                  fillColor: const Color(0xFFF7F9FB),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14),
                                    borderSide: BorderSide.none,
                                  ),
                                ),
                                obscureText: !showPassword,
                                onChanged: (_) => setState(() {}),
                                validator: (v) {
                                  if (v == null || v.isEmpty) return 'Mật khẩu không được để trống';
                                  if (v.length < 8) return 'Mật khẩu tối thiểu 8 ký tự';
                                  return null;
                                },
                              ),
                              const SizedBox(height: 10),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Checkbox(
                                        value: rememberMe,
                                        activeColor: const Color(0xFF0077B6),
                                        onChanged: (v) => setState(() => rememberMe = v ?? false),
                                      ),
                                      const Text('Nhớ mật khẩu', style: TextStyle(color: Colors.black87)),
                                    ],
                                  ),
                                  TextButton(
                                    onPressed: () => Navigator.pushNamed(context, '/forgot-password'),
                                    child: const Text('Quên mật khẩu?', style: TextStyle(color: Color(0xFF0077B6))),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF0077B6),
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                  ),
                                  onPressed: state.isLoading
                                      ? null
                                      : () {
                                          if (_formKey.currentState!.validate()) {
                                            context.read<AuthBloc>().add(LoginEvent(_emailController.text, _passwordController.text));
                                          }
                                        },
                                  child: state.isLoading
                                      ? const CircularProgressIndicator(color: Colors.white)
                                      : const Text('Đăng nhập', style: TextStyle(fontSize: 17, letterSpacing: 0.5, color: Colors.white)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text('hoặc', style: TextStyle(color: Colors.black87)),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          OutlinedButton.icon(
                            onPressed: () {
                              // TODO: Thêm login Google tại đây
                            },
                            icon: Image.asset('assets/images/google_logo.png', width: 28, height: 28),
                            label: const Text('Google', style: TextStyle(color: Colors.black87)),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide.none,
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              backgroundColor: Colors.white,
                              elevation: 2,
                              shadowColor: Colors.grey.shade300,
                            ),
                          ),
                          const SizedBox(width: 40),
                          OutlinedButton.icon(
                            onPressed: () {
                              // TODO: Thêm login Facebook tại đây
                            },
                            icon: const Icon(Icons.facebook, color: Colors.blue, size: 26),
                            label: const Text('Facebook', style: TextStyle(color: Colors.black87)),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide.none,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              backgroundColor: Colors.white,
                              elevation: 2,
                              shadowColor: Colors.grey.shade300,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text("Chưa có tài khoản?", style: TextStyle(color: Colors.black87)),
                          TextButton(
                            onPressed: () => Navigator.pushNamed(context, '/register'),
                            child: const Text('Tạo ngay', style: TextStyle(color: Color(0xFF0077B6))),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}