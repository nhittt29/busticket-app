import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:image_picker/image_picker.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';

class FaceRegistrationScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const FaceRegistrationScreen({super.key, this.user});

  @override
  State<FaceRegistrationScreen> createState() => _FaceRegistrationScreenState();
}

class _FaceRegistrationScreenState extends State<FaceRegistrationScreen> {
  File? _faceFile;
  final ImagePicker _picker = ImagePicker();
  final FaceDetector _faceDetector = FaceDetector(
    options: FaceDetectorOptions(
      enableContours: false,
      enableClassification: false,
    ),
  );
  bool _isProcessing = false;
  
  // MÀU CHÍNH
  static const Color primaryBlue = Color(0xFF6AB7F5);
  static const Color deepBlue = Color(0xFF1976D2);
  static const Color pastelBlue = Color(0xFFA0D8F1);

  @override
  void initState() {
    super.initState();
    // Có thể load ảnh cũ nếu muốn, nhưng ở đây tập trung vào chụp mới
  }

  @override
  void dispose() {
    _faceDetector.close();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final pickedFile = await _picker.pickImage(
        source: source,
        preferredCameraDevice: CameraDevice.front,
        imageQuality: 80,
      );
      if (pickedFile != null) {
        await _processImage(File(pickedFile.path));
      }
    } catch (e) {
      _showSnackBar('Lỗi khi chọn ảnh: $e', isError: true);
    }
  }

  Future<void> _processImage(File image) async {
    setState(() => _isProcessing = true);
    try {
      final inputImage = InputImage.fromFile(image);
      final faces = await _faceDetector.processImage(inputImage);

      if (faces.isEmpty) {
        _showSnackBar('Không tìm thấy khuôn mặt nào. Vui lòng thử lại.', isError: true);
        setState(() => _faceFile = null);
      } else if (faces.length > 1) {
        _showSnackBar('Phát hiện ${faces.length} khuôn mặt. Vui lòng chỉ chụp một mình bạn.', isError: true);
        setState(() => _faceFile = null);
      } else {
        // Hợp lệ: 1 khuôn mặt
        setState(() => _faceFile = image);
        _showSnackBar('Nhận diện khuôn mặt thành công!', isError: false);
      }
    } catch (e) {
      _showSnackBar('Lỗi xử lý ảnh: $e', isError: true);
      setState(() => _faceFile = null);
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  void _uploadFace() {
    if (_faceFile == null) {
      _showSnackBar('Vui lòng chụp hoặc chọn ảnh khuôn mặt', isError: true);
      return;
    }
    context.read<AuthBloc>().add(UpdateFaceAuthEvent(_faceFile!.path));
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.white),
          ),
          backgroundColor: isError ? Colors.redAccent : primaryBlue,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: const EdgeInsets.all(20),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    // Lấy faceUrl hiện tại từ user (nếu có)
    final existingFaceUrl = widget.user?['faceUrl'];
    String? displayUrl;
    if (existingFaceUrl != null && existingFaceUrl.toString().isNotEmpty) {
      if (existingFaceUrl.toString().startsWith('http')) {
        displayUrl = existingFaceUrl;
      } else {
        displayUrl = 'http://10.0.2.2:3000/$existingFaceUrl';
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF6AB7F5), Color(0xFF4A9EFF)],
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
          'Đăng ký Face ID',
          style: TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
      ),
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state.success && state.message != null && state.message!.contains('Đăng ký khuôn mặt')) {
            _showSnackBar(state.message!);
            Future.delayed(const Duration(seconds: 1), () {
              if (mounted) Navigator.pop(context);
            });
          } else if (state.error != null) {
            _showSnackBar(state.error!, isError: true);
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 20),
                const Text(
                  'Vui lòng chụp ảnh khuôn mặt rõ nét\nđể sử dụng tính năng xác thực nhanh',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.black54),
                ),
                const SizedBox(height: 40),

                // KHUNG ẢNH
                Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    border: Border.all(color: primaryBlue, width: 4),
                    boxShadow: [
                      BoxShadow(
                        color: primaryBlue.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: _faceFile != null
                        ? Image.file(_faceFile!, fit: BoxFit.cover)
                        : (displayUrl != null
                            ? Image.network(displayUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.face, size: 100, color: Colors.grey))
                            : const Icon(Icons.face, size: 100, color: Colors.grey)),
                  ),
                ),
                const SizedBox(height: 40),

                // NÚT CHỤP ẢNH
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildActionButton(
                      icon: Icons.camera_alt,
                      label: 'Chụp ảnh',
                      onPressed: () => _pickImage(ImageSource.camera),
                    ),
                    const SizedBox(width: 20),
                    _buildActionButton(
                      icon: Icons.photo_library,
                      label: 'Thư viện',
                      onPressed: () => _pickImage(ImageSource.gallery),
                    ),
                  ],
                ),

                const SizedBox(height: 50),

                // NÚT LƯU
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: state.isLoading ? null : _uploadFace,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryBlue,
                      foregroundColor: Colors.white,
                      elevation: 6,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: state.isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text(
                            'Lưu khuôn mặt',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildActionButton({required IconData icon, required String label, required VoidCallback onPressed}) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, color: deepBlue),
      label: Text(label, style: const TextStyle(color: deepBlue, fontWeight: FontWeight.w600)),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 3,
      ),
    );
  }
}
