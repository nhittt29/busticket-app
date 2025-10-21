import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'bloc/auth/auth_bloc.dart';
import 'bloc/home/home_bloc.dart'; // Import HomeBloc
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/reset_password_screen.dart';
import 'screens/home_screen.dart';
import 'screens/profile_screen.dart'; // Import ProfileScreen
import 'screens/profile_detail_screen.dart'; // Import ProfileDetailScreen
import 'screens/edit_profile_screen.dart'; // Import EditProfileScreen để hỗ trợ cập nhật
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp(); // Khởi tạo Firebase với xử lý lỗi
  } catch (e) {
    // Có thể thêm logger hoặc xử lý lỗi khác nếu cần
    // Ví dụ: print('Firebase initialization failed: $e');
  }
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => AuthBloc()), // Khởi tạo AuthBloc
        BlocProvider(create: (context) => HomeBloc()), // Khởi tạo HomeBloc
      ],
      child: MaterialApp(
        title: 'BusTicket App',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: '/login',
        routes: {
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/forgot-password': (context) => const ForgotPasswordScreen(),
          '/home': (context) => const HomeScreen(),
          '/profile': (context) => const ProfileScreen(), // Route cho ProfileScreen
          '/profile-detail': (context) => const ProfileDetailScreen(), // Route cho ProfileDetailScreen
          '/edit-profile': (context) => const EditProfileScreen(), // Route cho EditProfileScreen
          '/reset-password': (context) {
            final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
            if (args == null || !args.containsKey('email')) {
              throw ArgumentError('Email argument is required for ResetPasswordScreen');
            }
            return ResetPasswordScreen(email: args['email'] as String);
          },
        },
        // Xử lý lỗi navigation
        onUnknownRoute: (settings) {
          return MaterialPageRoute(
            builder: (context) => const Scaffold(
              body: Center(child: Text('Route not found')),
            ),
          );
        },
      ),
    );
  }
}