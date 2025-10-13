import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:shared_preferences/shared_preferences.dart'; // ✅ Thêm để xóa dữ liệu cũ
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/reset_password_screen.dart';
import 'theme/app_theme.dart'; // ✅ import AppTheme

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Xóa dữ liệu cũ trong SharedPreferences để test lại từ đầu
  final prefs = await SharedPreferences.getInstance();
  await prefs.clear();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BusTicket App',
      theme: AppTheme.lightTheme, // ✅ dùng theme pastel từ app_theme.dart
      debugShowCheckedModeBanner: false,
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/forgot-password': (context) => const ForgotPasswordScreen(),
        '/home': (context) => const HomeScreen(), // ✅ Loại bỏ email parameter
        '/reset-password': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
          if (args == null || !args.containsKey('email')) {
            throw ArgumentError('Email argument is required for ResetPasswordScreen');
          }
          return ResetPasswordScreen(email: args['email'] as String); // ✅ truyền email
        },
      },
    );
  }
}