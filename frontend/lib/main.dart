// lib/main.dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'bloc/auth/auth_bloc.dart';
import 'bloc/home/home_bloc.dart';
import 'booking/cubit/booking_cubit.dart';

import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/reset_password_screen.dart';
import 'screens/home_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/profile_detail_screen.dart';
import 'screens/edit_profile_screen.dart';

import 'booking/screens/search_screen.dart';
import 'booking/screens/trip_list_screen.dart';
import 'booking/screens/select_bus_screen.dart';

// THANH TOÁN
import 'payment/screens/payment_screen.dart';
import 'payment/screens/ticket_qr_screen.dart';
import 'payment/screens/my_tickets_screen.dart';

import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    print('Firebase initialization failed: $e');
  }
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => AuthBloc()),
        BlocProvider(create: (context) => HomeBloc()),
        BlocProvider(create: (context) => BookingCubit()), // TOÀN CỤC
      ],
      child: MaterialApp(
        title: 'BusTicket App',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: '/login',
        routes: {
          // AUTH
          '/login': (context) => const LoginScreen(),
          '/register': (context) => const RegisterScreen(),
          '/forgot-password': (context) => const ForgotPasswordScreen(),
          '/reset-password': (context) {
            final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
            if (args == null || !args.containsKey('email')) {
              return const Scaffold(body: Center(child: Text('Email không hợp lệ')));
            }
            return ResetPasswordScreen(email: args['email'] as String);
          },

          // HOME & PROFILE
          '/home': (context) => const HomeScreen(),
          '/profile': (context) => const ProfileScreen(),
          '/profile-detail': (context) => const ProfileDetailScreen(),
          '/edit-profile': (context) => const EditProfileScreen(),

          // BOOKING ROUTES
          '/search-trips': (context) => const SearchScreen(),
          '/trip-list': (context) => const TripListScreen(),
          '/select-bus': (context) {
            final args = ModalRoute.of(context)!.settings.arguments;
            if (args is! int) {
              // Nếu không có hoặc sai kiểu → về tìm kiếm
              return const SearchScreen();
            }
            return SelectBusScreen(scheduleId: args);
          },

          // THANH TOÁN ROUTES
          '/payment': (context) => const PaymentScreen(),
          '/ticket-qr': (context) => const TicketQRScreen(),
          '/my-tickets': (context) => const MyTicketsScreen(),
        },
        onUnknownRoute: (settings) {
          return MaterialPageRoute(
            builder: (context) => Scaffold(
              appBar: AppBar(title: const Text('Lỗi')),
              body: Center(child: Text('Không tìm thấy: ${settings.name}')),
            ),
          );
        },
      ),
    );
  }
}