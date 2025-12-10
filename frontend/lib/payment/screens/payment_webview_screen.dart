import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class PaymentWebViewScreen extends StatefulWidget {
  final String paymentUrl;
  final String title;
  final Color appBarColor;

  const PaymentWebViewScreen({
    super.key,
    required this.paymentUrl,
    required this.title,
    required this.appBarColor,
  });

  @override
  State<PaymentWebViewScreen> createState() => _PaymentWebViewScreenState();
}

class _PaymentWebViewScreenState extends State<PaymentWebViewScreen> {
  late final WebViewController controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            setState(() => _isLoading = true);
          },
          onPageFinished: (url) {
            setState(() => _isLoading = false);
          },
          onNavigationRequest: (NavigationRequest request) {
            debugPrint('Payment WebView Navigation: ${request.url}');
            
            // 1. ZaloPay Success Logic
            if (request.url.contains('busticket-app.demo/payment-result') || 
                request.url.contains('payment-result')) {
              Navigator.pop(context, true); 
              return NavigationDecision.prevent;
            }

            // 2. MoMo Success Logic (Custom Scheme)
            if (request.url.startsWith('busticket://')) {
              Navigator.pop(context, true);
              return NavigationDecision.prevent;
            }

            // 3. Handle App Deep Links (momo://, zalopay://, etc.)
            // If the user clicks "Open App" button in the webview
            final uri = Uri.parse(request.url);
            if (uri.scheme != 'http' && uri.scheme != 'https') {
              _launchDeepLink(uri);
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  Future<void> _launchDeepLink(Uri uri) async {
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      debugPrint('Could not launch deep link: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        centerTitle: true,
        backgroundColor: widget.appBarColor,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: controller),
          if (_isLoading)
            Center(child: CircularProgressIndicator(color: widget.appBarColor)),
        ],
      ),
    );
  }
}
