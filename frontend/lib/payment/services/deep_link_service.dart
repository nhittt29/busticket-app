import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../main.dart';
import '../../bloc/home/home_bloc.dart';
import '../../bloc/home/home_event.dart';
import '../../ticket/services/ticket_api_service.dart';

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
    final paymentIdParam = uri.queryParameters['paymentId'];

    int? targetId;
    String route = '/group-qr';

    if (paymentIdParam != null) {
      targetId = int.tryParse(paymentIdParam);
    } else if (ticketIdParam != null) {
      final ticketId = int.tryParse(ticketIdParam);
      if (ticketId != null) {
        try {
          final ticket = await TicketApiService.getTicketDetail(ticketId);
          targetId = ticket['paymentHistoryId'] as int?;
        } catch (_) {}
      }
    }

    if (targetId == null) return;

    final navigator = MyApp.navigatorKey.currentState;
    if (navigator == null) return;
    final context = MyApp.navigatorKey.currentContext;
    if (context == null) return;

    final homeBloc = BlocProvider.of<HomeBloc>(context);
    homeBloc.add(ClearTicketIdEvent());
    await Future.delayed(const Duration(milliseconds: 100));
    homeBloc.add(LoadUserEvent());
    navigator.pushNamedAndRemoveUntil('/home', (route) => false);

    Future.delayed(const Duration(milliseconds: 500), () {
      if (context.mounted) {
        Navigator.pushNamed(context, route, arguments: targetId);
      }
    });
  }
}