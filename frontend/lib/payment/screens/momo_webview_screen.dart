import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class MomoWebViewScreen extends StatefulWidget {
  final String paymentUrl;
  final String? title;
  const MomoWebViewScreen({super.key, required this.paymentUrl, this.title});

  @override
  State<MomoWebViewScreen> createState() => _MomoWebViewScreenState();
}

class _MomoWebViewScreenState extends State<MomoWebViewScreen> {
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
            debugPrint('MoMo WebView Navigation: ${request.url}');
            // Check for custom scheme or specific success URL
            if (request.url.startsWith('busticket://payment-success') || 
                request.url.contains('payment-success')) {
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
        title: Text(widget.title ?? 'Thanh toán MoMo'),
        centerTitle: true,
        backgroundColor: const Color(0xFFD82D8B), // MoMo pink color
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: controller),
          if (_isLoading)
            const Center(child: CircularProgressIndicator(color: Color(0xFFD82D8B))),
        ],
      ),
    );
  }
}