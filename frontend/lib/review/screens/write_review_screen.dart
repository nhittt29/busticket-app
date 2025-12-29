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
import '../../theme/app_colors.dart';

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
    } else {
      context.read<ReviewCubit>().createReview(
            widget.ticketId,
            _rating,
            _commentController.text,
            images,
          );
    }
  }

  void _showImageSourceModal() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
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
                decoration: BoxDecoration(color: AppColors.primaryBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.camera_alt_rounded, color: AppColors.primaryBlue),
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
                decoration: BoxDecoration(color: AppColors.successGreen.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.photo_library_rounded, color: AppColors.successGreen),
              ),
              title: const Text('Chọn từ thư viện', style: TextStyle(fontWeight: FontWeight.bold)),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50], // Sạch hơn, làm nổi bật các card trắng
      extendBodyBehindAppBar: true, 
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.primaryBlue, AppColors.accentBlue],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Đánh giá chuyến đi',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        centerTitle: true,
      ),
      body: BlocListener<ReviewCubit, ReviewState>(
        listener: (context, state) {
          if (state is ReviewOperationSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: AppColors.successGreen),
            );
            if (widget.paymentHistoryId != null) {
               final authState = context.read<AuthBloc>().state;
               if (authState.user?['id'] != null) {
                  ReminderService().cancelReviewReminders(
                    paymentHistoryId: widget.paymentHistoryId!, 
                    userId: authState.user!['id']
                  );
               }
            }
            Navigator.pop(context);
          } else if (state is ReviewError) {
             ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: Colors.redAccent),
            );
          }
        },
        child: Column(
          children: [
             // HEADER CURVED BACKGROUND
             Expanded(
               flex: 0,
               child: Stack(
                 children: [
                    Container(
                      height: 180,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.primaryBlue, AppColors.accentBlue],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                        borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
                      ),
                    ),
                    Positioned.fill(
                      child: Align(
                        alignment: Alignment.center,
                        child: Padding(
                          padding: const EdgeInsets.only(top: 60),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.thumb_up_alt_rounded, size: 40, color: Colors.white.withOpacity(0.9)),
                              const SizedBox(height: 8),
                              const Text(
                                "Cảm nhận của bạn?",
                                style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "Chia sẻ để chúng tôi phục vụ tốt hơn",
                                style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                 ],
               ),
             ),
             
             // FORM CONTENT
             Expanded(
               child: SingleChildScrollView(
                 padding: const EdgeInsets.all(20),
                 child: Form(
                   key: _formKey,
                   child: Column(
                     children: [
                        // RATING CARD
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: const Offset(0, 5))
                            ]
                          ),
                          child: Column(
                            children: [
                              Text(
                                _getRatingLabel(_rating),
                                style: TextStyle(
                                  fontSize: 18, 
                                  fontWeight: FontWeight.bold,
                                  color: _getRatingColor(_rating)
                                ),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: List.generate(5, (i) {
                                  return GestureDetector(
                                    onTap: () => setState(() => _rating = i + 1),
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      margin: const EdgeInsets.symmetric(horizontal: 4),
                                      child: Icon(
                                        i < _rating ? Icons.star_rounded : Icons.star_outline_rounded,
                                        color: i < _rating ? Colors.amber : Colors.grey[300],
                                        size: 40,
                                      ),
                                    ),
                                  );
                                }),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        
                        // TEXT INPUT
                        TextFormField(
                          controller: _commentController,
                          maxLines: 5,
                          style: const TextStyle(fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'Nhập nội dung đánh giá (tối thiểu 10 ký tự)...',
                            hintStyle: TextStyle(color: Colors.grey[400]),
                            fillColor: Colors.white,
                            filled: true,
                            contentPadding: const EdgeInsets.all(16),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(color: Colors.grey.shade200),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: const BorderSide(color: AppColors.primaryBlue),
                            ),
                            // Shadow decoration is better done with Container wrapping, but InputDecorator works too.
                          ),
                          validator: (value) {
                             if (value == null || value.trim().isEmpty) return 'Vui lòng nhập nội dung đánh giá';
                             if (value.trim().length < 10) return 'Nội dung quá ngắn (tối thiểu 10 ký tự)';
                             return null;
                          },
                        ),
                        const SizedBox(height: 20),
                        
                        // IMAGE PICKER
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            "Thêm hình ảnh (${_selectedImages.length}/5)",
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.grey[700]),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 100,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: _selectedImages.length + (_selectedImages.length < 5 ? 1 : 0),
                            separatorBuilder: (_, __) => const SizedBox(width: 12),
                            itemBuilder: (context, index) {
                              if (index == _selectedImages.length) {
                                return GestureDetector(
                                  onTap: _showImageSourceModal,
                                  child: Container(
                                    width: 100,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: AppColors.primaryBlue.withOpacity(0.5), style: BorderStyle.solid),
                                    ),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.add_photo_alternate_rounded, color: AppColors.primaryBlue.withOpacity(0.8), size: 32),
                                        const SizedBox(height: 4),
                                        Text("Thêm ảnh", style: TextStyle(color: AppColors.primaryBlue.withOpacity(0.8), fontSize: 12, fontWeight: FontWeight.bold))
                                      ],
                                    ),
                                  ),
                                );
                              }
                              return Stack(
                                clipBehavior: Clip.none,
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(16),
                                    child: Image.file(
                                      File(_selectedImages[index].path),
                                      width: 100, height: 100,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                  Positioned(
                                    top: -6, right: -6,
                                    child: GestureDetector(
                                      onTap: () => _removeImage(index),
                                      child: Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle),
                                        child: const Icon(Icons.close, size: 14, color: Colors.white),
                                      ),
                                    ),
                                  )
                                ],
                              );
                            },
                          ),
                        ),
                        
                        const SizedBox(height: 40),
                        
                        // SUBMIT BUTTON
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: (_isConverting || context.read<ReviewCubit>().state is ReviewLoading) ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryBlue,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 5,
                              shadowColor: AppColors.primaryBlue.withOpacity(0.4),
                            ),
                            child: (_isConverting || context.read<ReviewCubit>().state is ReviewLoading) 
                              ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text("Gửi đánh giá", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                        ),
                        const SizedBox(height: 20),
                     ],
                   ),
                 ),
               ),
             ),
          ],
        ),
      ),
    );
  }

  String _getRatingLabel(int rating) {
    switch (rating) {
      case 1: return 'Rất không hài lòng';
      case 2: return 'Không hài lòng';
      case 3: return 'Bình thường';
      case 4: return 'Hài lòng';
      case 5: return 'Tuyệt vời!';
      default: return '';
    }
  }
  
  Color _getRatingColor(int rating) {
     if (rating >= 4) return AppColors.successGreen;
     if (rating == 3) return Colors.orange;
     return Colors.redAccent;
  }
}