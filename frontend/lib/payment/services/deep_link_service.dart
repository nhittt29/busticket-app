// lib/payment/services/deep_link_service.dart
import 'package:app_links/app_links.dart';
import '../../main.dart';

class DeepLinkService {
  static final DeepLinkService _instance = DeepLinkService._();
  static DeepLinkService get instance => _instance;
  DeepLinkService._();

  final AppLinks _appLinks = AppLinks();

  void init() {
    _appLinks.uriLinkStream.listen(_handleLink);
    _appLinks.getInitialAppLink().then(_handleLink);
  }

  void _handleLink(Uri? uri) {
    if (uri == null) return;
    if (!uri.path.contains('payment-success')) return;

    final ticketIdParam = uri.queryParameters['ticketId'];
    if (ticketIdParam == null) return;

    final ticketId = int.tryParse(ticketIdParam);
    if (ticketId == null) return;

    final navigator = MyApp.navigatorKey.currentState;
    navigator?.pushNamedAndRemoveUntil(
      '/ticket-qr',
      (route) =>
          route.settings.name == '/home' ||
          route.settings.name == '/login' ||
          route.settings.name == '/',
      arguments: ticketId,
    );
  }
}