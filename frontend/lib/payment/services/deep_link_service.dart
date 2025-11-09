// lib/payment/services/deep_link_service.dart
import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../main.dart';
import '../../bloc/home/home_bloc.dart';
import '../../bloc/home/home_event.dart';
import '../../ticket/screens/ticket_detail_screen.dart';
import '../../ticket/services/ticket_api_service.dart'; // ĐÃ THÊM

class DeepLinkService {
  static final DeepLinkService _instance = DeepLinkService._();
  static DeepLinkService get instance => _instance;
  DeepLinkService._();

  final AppLinks _appLinks = AppLinks();

  void init() {
    _appLinks.uriLinkStream.listen(_handleLink);
    _appLinks.getInitialAppLink().then(_handleLink);
  }

  Future<void> _handleLink(Uri? uri) async {
    if (uri == null) return;
    if (!uri.path.contains('payment-success')) return;

    final ticketIdParam = uri.queryParameters['ticketId'];
    if (ticketIdParam == null) return;

    final ticketId = int.tryParse(ticketIdParam);
    if (ticketId == null) return;

    final navigator = MyApp.navigatorKey.currentState;
    if (navigator == null) return;

    final context = MyApp.navigatorKey.currentContext;
    if (context == null) return;

    final homeBloc = BlocProvider.of<HomeBloc>(context);

    homeBloc.add(ClearTicketIdEvent());
    await Future.delayed(const Duration(milliseconds: 100));
    homeBloc.add(LoadUserEvent());

    navigator.pushNamedAndRemoveUntil('/home', (route) => false);

    // GỌI API ĐỂ LẤY DỮ LIỆU ĐẦY ĐỦ (có route)
    final ticketData = await TicketApiService.getTicketDetail(ticketId);

    Future.delayed(const Duration(milliseconds: 500), () {
      if (context.mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => TicketDetailScreen(
              ticketId: ticketId,
              // BỎ ticketData → DÙNG API TRỰC TIẾP TRONG TicketDetailScreen
            ),
          ),
        );
      }
    });
  }
}