// lib/review/screens/write_review_screen.dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import '../cubit/review_cubit.dart';
import '../cubit/review_state.dart';
import '../models/review.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../../services/reminder_service.dart';


const Color primaryBlue = Color(0xFF6AB7F5);
const Color accentBlue = Color(0xFF4A9EFF);
const Color deepBlue = Color(0xFF1976D2);
const Color pastelBlue = Color(0xFFA0D8F1);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color successGreen = Color(0xFF4CAF50);

// MÀU ĐÁNH GIÁ – ĐỒNG BỘ VỚI MyReviewsScreen
const Color reviewGradientStart = Color(0xFFFF9A3C);
const Color reviewGradientEnd = Color(0xFFFF6B35);

class WriteReviewScreen extends StatefulWidget {
  final int ticketId;
  final int busId;
  final Review? existingReview;
  final int? paymentHistoryId;

  const WriteReviewScreen({
    super.key,
    required this.ticketId,
    required this.busId,
    this.existingReview,
    this.paymentHistoryId,
  });


  @override
  State<WriteReviewScreen> createState() => _WriteReviewScreenState();
}

class _WriteReviewScreenState extends State<WriteReviewScreen> {
  late int _rating;
  late TextEditingController _commentController;
  final _formKey = GlobalKey<FormState>();
  final List<XFile> _selectedImages = [];
  final ImagePicker _picker = ImagePicker();
  bool _isConverting = false;

  @override
  void initState() {
    super.initState();
    _rating = widget.existingReview?.rating ?? 5;
    _commentController = TextEditingController(text: widget.existingReview?.comment ?? '');
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(source: source, imageQuality: 70);
      if (image != null && _selectedImages.length < 5) {
        setState(() {
          _selectedImages.add(image);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi chọn ảnh: $e'), backgroundColor: Colors.redAccent),
      );
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Future<List<String>> _convertImagesToBase64() async {
    List<String> base64Images = [];
    for (var image in _selectedImages) {
      final bytes = await image.readAsBytes();
      final base64String = base64Encode(bytes);
      base64Images.add('data:image/jpeg;base64,$base64String');
    }
    // Giữ lại ảnh cũ nếu đang sửa đánh giá
    if (widget.existingReview != null && widget.existingReview!.images.isNotEmpty) {
      base64Images.insertAll(0, widget.existingReview!.images);
    }
    return base64Images;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isConverting = true);
    final images = await _convertImagesToBase64();
    setState(() => _isConverting = false);

    if (!mounted) return;

    if (widget.existingReview != null) {
      context.read<ReviewCubit>().updateReview(
            widget.existingReview!.id,
            _rating,
            _commentController.text,
            images,
          );
      // Sửa đánh giá thì không cần hủy nhắc nhở (vì đã đánh giá rồi)
    } else {
      context.read<ReviewCubit>().createReview(
            widget.ticketId,
            _rating,
            _commentController.text,
            images,
          );
      
      // HỦY NHẮC NHỞ NGAY SAU KHI GỬI (NẾU CÓ PAYMENT ID)
      // Logic đã chuyển sang BlocListener để đảm bảo chỉ hủy khi thành công
    }


  }

  void _showImageSourceModal() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      backgroundColor: Colors.white,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 50, height: 5, color: Colors.grey[300], margin: const EdgeInsets.only(bottom: 20)),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: reviewGradientStart.withAlpha(50), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.camera_alt_rounded, color: reviewGradientStart),
              ),
              title: const Text('Chụp ảnh', style: TextStyle(fontWeight: FontWeight.bold)),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.green.withAlpha(50), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.photo_library_rounded, color: Colors.green),
              ),
              title: const Text('Chọn từ thư viện', style: TextStyle(fontWeight: FontWeight.bold)),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [reviewGradientStart, reviewGradientEnd],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.existingReview != null ? 'Sửa đánh giá' : 'Viết đánh giá',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 23,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
      ),
      body: BlocListener<ReviewCubit, ReviewState>(
        listener: (context, state) {
          if (state is ReviewOperationSuccess) {
            ScaffoldMessenger.of(context)
              ..hideCurrentSnackBar()
              ..showSnackBar(
                SnackBar(
                  content: Text(state.message, style: const TextStyle(fontWeight: FontWeight.bold)),
                  backgroundColor: successGreen,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  margin: const EdgeInsets.all(16),
                ),
              );
            
            // HỦY NHẮC NHỞ NẾU CÓ
            if (widget.paymentHistoryId != null) {
               final authState = context.read<AuthBloc>().state;
               final userId = authState.user?['id'];
               if (userId != null) {
                  ReminderService().cancelReviewReminders(
                    paymentHistoryId: widget.paymentHistoryId!, 
                    userId: userId
                  );
               }
            }

            Navigator.pop(context);

          } else if (state is ReviewError) {
            ScaffoldMessenger.of(context)
              ..hideCurrentSnackBar()
              ..showSnackBar(
                SnackBar(
                  content: Text(state.message, style: const TextStyle(fontWeight: FontWeight.bold)),
                  backgroundColor: Colors.redAccent,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  margin: const EdgeInsets.all(16),
                ),
              );
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 32, 24, 40),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Text(
                  'Chuyến đi của bạn thế nào?',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: deepBlue),
                ),
                const SizedBox(height: 12),
                Text(
                  'Hãy chia sẻ trải nghiệm để giúp chúng tôi cải thiện dịch vụ nhé!',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.grey[700], height: 1.5),
                ),
                const SizedBox(height: 40),

                // STAR RATING – ĐẸP NHƯ MyReviewsScreen
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (i) => GestureDetector(
                    onTap: () => setState(() => _rating = i + 1),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      child: Icon(
                        i < _rating ? Icons.star_rounded : Icons.star_border_rounded,
                        color: i < _rating ? Colors.amber : Colors.grey[350],
                        size: 52,
                      ),
                    ),
                  )),
                ),
                const SizedBox(height: 16),
                Text(
                  _getRatingLabel(_rating),
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: _rating >= 4 ? successGreen : _rating == 3 ? Colors.orange : Colors.redAccent,
                  ),
                ),
                const SizedBox(height: 40),

                // COMMENT INPUT
                TextFormField(
                  controller: _commentController,
                  maxLines: 6,
                  decoration: InputDecoration(
                    hintText: 'Nhập nội dung đánh giá của bạn...',
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
                      borderSide: const BorderSide(color: reviewGradientStart, width: 2.5),
                    ),
                    contentPadding: const EdgeInsets.all(20),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) return 'Vui lòng nhập nội dung đánh giá';
                    if (value.trim().length < 10) return 'Nội dung quá ngắn (tối thiểu 10 ký tự)';
                    return null;
                  },
                ),
                const SizedBox(height: 32),

                // IMAGE PICKER
                Row(
                  children: [
                    Text(
                      'Thêm hình ảnh (${_selectedImages.length}/5)',
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: deepBlue),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 110,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _selectedImages.length + (_selectedImages.length < 5 ? 1 : 0),
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (context, index) {
                      if (index == _selectedImages.length) {
                        return GestureDetector(
                          onTap: _showImageSourceModal,
                          child: Container(
                            width: 110,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: reviewGradientStart.withAlpha(100), width: 2, style: BorderStyle.solid),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_a_photo_rounded, size: 36, color: reviewGradientStart),
                                const SizedBox(height: 8),
                                Text('Thêm ảnh', style: TextStyle(fontSize: 13, color: reviewGradientStart, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        );
                      }
                      return Stack(
                        clipBehavior: Clip.none,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(20),
                            child: Image.file(
                              File(_selectedImages[index].path),
                              width: 110,
                              height: 110,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: -8,
                            right: -8,
                            child: GestureDetector(
                              onTap: () => _removeImage(index),
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                                child: const Icon(Icons.close, size: 18, color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
                const SizedBox(height: 48),

                // SUBMIT BUTTON
                SizedBox(
                  width: double.infinity,
                  height: 66,
                  child: ElevatedButton.icon(
                    onPressed: (_isConverting || context.read<ReviewCubit>().state is ReviewLoading) ? null : _submit,
                    icon: (_isConverting || context.read<ReviewCubit>().state is ReviewLoading)
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                        : const Icon(Icons.send_rounded, size: 28),
                    label: Text(
                      (_isConverting || context.read<ReviewCubit>().state is ReviewLoading) ? 'Đang gửi...' : 'Gửi đánh giá',
                      style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: reviewGradientStart,
                      foregroundColor: Colors.white,
                      elevation: 12,
                      shadowColor: reviewGradientStart.withAlpha(130),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _getRatingLabel(int rating) {
    switch (rating) {
      case 1: return 'Rất tệ';
      case 2: return 'Không hài lòng';
      case 3: return 'Bình thường';
      case 4: return 'Hài lòng';
      case 5: return 'Tuyệt vời!';
      default: return '';
    }
  }
}