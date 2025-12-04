// lib/review/screens/write_review_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/review_bloc.dart';
import '../bloc/review_event.dart';
import '../bloc/review_state.dart';

const Color primaryBlue = Color(0xFF6AB7F5);
const Color accentBlue = Color(0xFF4A9EFF);
const Color deepBlue = Color(0xFF1976D2);
const Color pastelBlue = Color(0xFFA0D8F1);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color successGreen = Color(0xFF4CAF50);

class WriteReviewScreen extends StatefulWidget {
  final int ticketId;
  final int userId;
  final Map<String, dynamic> ticketData;

  const WriteReviewScreen({
    super.key,
    required this.ticketId,
    required this.userId,
    required this.ticketData,
  });

  @override
  State<WriteReviewScreen> createState() => _WriteReviewScreenState();
}

class _WriteReviewScreenState extends State<WriteReviewScreen> {
  int _rating = 5;
  final TextEditingController _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final schedule = widget.ticketData['schedule'];
    final route = schedule['route'];
    final bus = schedule['bus'];

    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [primaryBlue, accentBlue],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Viết đánh giá',
          style: TextStyle(
            color: Colors.white,
            fontSize: 23,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
      ),
      body: BlocListener<ReviewBloc, ReviewState>(
        listener: (context, state) {
          if (state.submitSuccess) {
            ScaffoldMessenger.of(context)
              ..hideCurrentSnackBar()
              ..showSnackBar(
                SnackBar(
                  content: const Text('Đánh giá của bạn đã được gửi thành công!', style: TextStyle(fontWeight: FontWeight.w600)),
                  backgroundColor: successGreen,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  margin: const EdgeInsets.all(16),
                  duration: const Duration(seconds: 3),
                ),
              );
            Navigator.pop(context);
          }
          if (state.error != null) {
            ScaffoldMessenger.of(context)
              ..hideCurrentSnackBar()
              ..showSnackBar(
                SnackBar(
                  content: Text('Lỗi: ${state.error}', style: const TextStyle(fontWeight: FontWeight.w600)),
                  backgroundColor: Colors.redAccent,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  margin: const EdgeInsets.all(16),
                  duration: const Duration(seconds: 4),
                ),
              );
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // THÔNG TIN CHUYẾN ĐI – ĐẸP, SANG TRỌNG
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: pastelBlue.withAlpha(150), width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withAlpha(60),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [primaryBlue, accentBlue]),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(color: primaryBlue.withAlpha(100), blurRadius: 12, offset: const Offset(0, 6)),
                        ],
                      ),
                      child: const Icon(Icons.directions_bus_rounded, color: Colors.white, size: 36),
                    ),
                    const SizedBox(width: 18),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            bus['brand']['name'] ?? 'Nhà xe',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: deepBlue),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${route['startPoint']} → ${route['endPoint']}',
                            style: TextStyle(fontSize: 16, color: Colors.grey[700], fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Mã vé: ${widget.ticketData['ticketCode'] ?? widget.ticketId}',
                            style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // ĐÁNH GIÁ SAO – TO, ĐẸP, CÓ HIỆU ỨNG
              Center(
                child: Column(
                  children: [
                    const Text(
                      'Bạn cảm thấy chuyến đi thế nào?',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: deepBlue),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(5, (index) {
                        return GestureDetector(
                          onTap: () => setState(() => _rating = index + 1),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: const EdgeInsets.symmetric(horizontal: 8),
                            child: Icon(
                              index < _rating ? Icons.star_rounded : Icons.star_border_rounded,
                              color: index < _rating ? Colors.amber : Colors.grey[400],
                              size: _rating == index + 1 ? 56 : 48,
                            ),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _rating >= 4
                          ? 'Tuyệt vời!'
                          : _rating == 3
                              ? 'Bình thường'
                              : 'Cần cải thiện',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                        color: _rating >= 4 ? successGreen : _rating == 3 ? Colors.orange : Colors.redAccent,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // NHẬN XÉT
              const Text(
                'Chia sẻ cảm nhận của bạn (tùy chọn)',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: deepBlue),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _commentController,
                maxLines: 6,
                textInputAction: TextInputAction.newline,
                decoration: InputDecoration(
                  hintText: 'Ví dụ: Xe sạch sẽ, tài xế thân thiện, đúng giờ...',
                  hintStyle: TextStyle(color: Colors.grey[500]),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide(color: pastelBlue.withAlpha(180), width: 1.5),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide(color: pastelBlue.withAlpha(180), width: 1.5),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: const BorderSide(color: primaryBlue, width: 2.5),
                  ),
                  contentPadding: const EdgeInsets.all(20),
                ),
              ),
              const SizedBox(height: 40),

              // NÚT GỬI ĐÁNH GIÁ
              SizedBox(
                width: double.infinity,
                height: 64,
                child: BlocBuilder<ReviewBloc, ReviewState>(
                  builder: (context, state) {
                    return ElevatedButton.icon(
                      onPressed: state.loading
                          ? null
                          : () {
                              if (_rating < 1) return;
                              context.read<ReviewBloc>().add(
                                    SubmitReviewEvent(
                                      userId: widget.userId,
                                      ticketId: widget.ticketId,
                                      rating: _rating,
                                      comment: _commentController.text.trim(),
                                    ),
                                  );
                            },
                      icon: state.loading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                            )
                          : const Icon(Icons.send_rounded, size: 28),
                      label: Text(
                        state.loading ? 'Đang gửi...' : 'Gửi đánh giá',
                        style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryBlue,
                        foregroundColor: Colors.white,
                        elevation: 10,
                        shadowColor: primaryBlue.withAlpha(130),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}