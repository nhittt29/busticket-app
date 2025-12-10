import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class ZaloPayWebViewScreen extends StatefulWidget {
  final String paymentUrl;
  const ZaloPayWebViewScreen({super.key, required this.paymentUrl});

  @override
  State<ZaloPayWebViewScreen> createState() => _ZaloPayWebViewScreenState();
}

class _ZaloPayWebViewScreenState extends State<ZaloPayWebViewScreen> {
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
            debugPrint('ZaloPay WebView Navigation: ${request.url}');
            // Intercept ZaloPay Redirect URL
            // Matches 'redirecturl' in backend ZaloPayService
            if (request.url.contains('busticket-app.demo/payment-result') || 
                request.url.contains('payment-result')) {
              Navigator.pop(context, true); // Indicate success
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thanh toán ZaloPay'),
        centerTitle: true,
        backgroundColor: const Color(0xFF008FE5), // ZaloPay Blue
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: controller),
          if (_isLoading)
            const Center(child: CircularProgressIndicator(color: Color(0xFF008FE5))),
        ],
      ),
    );
  }
}
