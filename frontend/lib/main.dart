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

import 'payment/screens/payment_screen.dart';
import 'ticket/screens/my_tickets_screen.dart';
import 'ticket/screens/ticket_qr_screen.dart';
import 'payment/screens/payment_success_screen.dart';

import 'payment/services/deep_link_service.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase initialization failed: $e');
  }

  // Khởi tạo DeepLink để xử lý MoMo trả về
  DeepLinkService.instance.init();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // Key toàn cục để điều hướng từ bất kỳ đâu (dùng cho DeepLink)
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => AuthBloc()),
        BlocProvider(create: (context) => HomeBloc()),
        BlocProvider(create: (context) => BookingCubit()),
      ],
      child: MaterialApp(
        title: 'BusTicket App',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        navigatorKey: navigatorKey,
        initialRoute: '/login',
        routes: {

          // 1. MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ / QUÊN MẬT KHẨU

          '/login': (context) => const LoginScreen(), // Màn hình đăng nhập
          '/register': (context) => const RegisterScreen(), // Màn hình đăng ký
          '/forgot-password': (context) => const ForgotPasswordScreen(), // Quên mật khẩu
          '/reset-password': (context) {
            // Nhận email từ màn hình quên mật khẩu
            final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
            if (args == null || !args.containsKey('email')) {
              return const Scaffold(body: Center(child: Text('Email không hợp lệ')));
            }
            return ResetPasswordScreen(email: args['email'] as String);
          },

          // 2. MÀN HÌNH CHÍNH (HOME) & HỒ SƠ

          '/home': (context) => const HomeScreen(), // Trang chủ - Danh sách chuyến xe
          '/profile': (context) => const ProfileScreen(), // Trang hồ sơ người dùng
          '/profile-detail': (context) => const ProfileDetailScreen(), // Chi tiết hồ sơ
          '/edit-profile': (context) => const EditProfileScreen(), // Chỉnh sửa hồ sơ

          // 3. ĐẶT VÉ - TÌM KIẾM & CHỌN CHUYẾN

          '/search-trips': (context) => const SearchScreen(), // Tìm kiếm chuyến xe
          '/trip-list': (context) => const TripListScreen(), // Danh sách chuyến theo tuyến
          '/select-bus': (context) {
            // Nhận scheduleId từ TripListScreen
            final args = ModalRoute.of(context)!.settings.arguments;
            if (args is! int) return const SearchScreen();
            return SelectBusScreen(scheduleId: args); // Chọn ghế
          },


          // 4. THANH TOÁN

          '/payment': (context) => const PaymentScreen(), // Màn hình thanh toán MoMo
          '/payment-success': (context) => const PaymentSuccessScreen(), // Thành công (tạm thời)

          // 5. VÉ XE - QUẢN LÝ VÉ & XEM QR

          '/my-tickets': (context) => const MyTicketsScreen(), // Danh sách vé đã đặt
          '/ticket-qr': (context) {
            // Nhận từ DeepLink hoặc từ TicketDetailScreen
            final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
            if (args == null || !args.containsKey('qrUrl') || !args.containsKey('ticket')) {
              return const Scaffold(
                body: Center(child: Text('Không tìm thấy mã QR')),
              );
            }
            return TicketQRScreen(
              qrUrl: args['qrUrl'] as String,
              ticket: args['ticket'],
            );
          },
        },
        onUnknownRoute: (settings) => MaterialPageRoute(
          builder: (context) => Scaffold(
            appBar: AppBar(title: const Text('Lỗi')),
            body: Center(child: Text('Không tìm thấy: ${settings.name}')),
          ),
        ),
      ),
    );
  }
}