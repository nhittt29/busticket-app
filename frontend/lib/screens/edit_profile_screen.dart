//lib/screens/edit_profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const EditProfileScreen({super.key, this.user});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController nameController;
  late TextEditingController phoneController;
  late TextEditingController dobController;
  late TextEditingController genderController;
  File? _newAvatarFile;
  final ImagePicker _picker = ImagePicker();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final Map<String, String> genderMap = {
    'Nam': 'MALE',
    'Nữ': 'FEMALE',
    'Khác': 'OTHER',
  };

  // MÀU CHÍNH – ĐỒNG BỘ TOÀN BỘ APP
  static const Color primaryBlue = Color(0xFF6AB7F5);
  static const Color deepBlue = Color(0xFF1976D2);
  static const Color pastelBlue = Color(0xFFA0D8F1);
  static const Color successBlue = Color(0xFF4A9EFF);

  @override
  void initState() {
    super.initState();
    final user = widget.user ?? {};
    final dobValue = user['dob'];
    String initialDob = '';
    if (dobValue != null) {
      if (dobValue is DateTime) {
        initialDob = dobValue.toIso8601String().split('T')[0];
      } else if (dobValue is String && dobValue.isNotEmpty) {
        initialDob = dobValue.split('T')[0];
      }
    }

    nameController = TextEditingController(text: user['name'] ?? '');
    phoneController = TextEditingController(text: user['phone'] ?? '');
    dobController = TextEditingController(text: initialDob);
    final backendGender = user['gender'] ?? 'OTHER';
    genderController = TextEditingController(
      text: genderMap.entries
          .firstWhere(
            (entry) => entry.value == backendGender,
            orElse: () => const MapEntry('Khác', 'OTHER'),
          )
          .key,
    );
  }

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    dobController.dispose();
    genderController.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    try {
      final pickedFile = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
      if (!mounted) return;
      if (pickedFile != null) {
        setState(() => _newAvatarFile = File(pickedFile.path));
      } else {
        _showSnackBar('Không chọn được ảnh', isError: true);
      }
    } catch (e) {
      if (!mounted) return;
      _showSnackBar('Lỗi khi chọn ảnh: $e', isError: true);
    }
  }

  bool _isValidDateFormat(String date) {
    final RegExp dateRegex = RegExp(r'^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$');
    return dateRegex.hasMatch(date);
  }

  void _saveProfile() {
    if (_formKey.currentState!.validate()) {
      final authBloc = context.read<AuthBloc>();
      DateTime? dob;
      if (dobController.text.isNotEmpty) {
        try {
          dob = DateTime.parse(dobController.text);
        } catch (e) {
          _showSnackBar('Ngày sinh không hợp lệ', isError: true);
          return;
        }
      }
      final backendGender = genderMap[genderController.text] ?? 'OTHER';
      authBloc.add(UpdateUserEvent(
        name: nameController.text.trim(),
        phone: phoneController.text.isEmpty ? null : phoneController.text.trim(),
        dob: dob,
        gender: backendGender,
        avatarPath: _newAvatarFile?.path,
      ));
    }
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
          backgroundColor: isError ? Colors.redAccent : successBlue,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: const EdgeInsets.all(20),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          duration: const Duration(seconds: 3),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
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
          'Chỉnh sửa thông tin',
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
          if (state.success && state.message != null) {
            _showSnackBar(state.message!);
            Future.delayed(const Duration(seconds: 2), () {
              if (mounted) {
                Navigator.pop(context);
              }
            });
          } else if (state.error != null) {
            _showSnackBar(state.error!, isError: true);
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // AVATAR SIÊU ĐẸP
                  Center(
                    child: GestureDetector(
                      onTap: _pickAvatar,
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: primaryBlue, width: 5),
                          boxShadow: [
                            BoxShadow(
                              color: primaryBlue.withAlpha(102), // 0.4 * 255
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: CircleAvatar(
                          radius: 74,
                          backgroundColor: pastelBlue.withAlpha(51), // ~0.2
                          backgroundImage: _newAvatarFile != null
                              ? FileImage(_newAvatarFile!)
                              : widget.user?['avatar'] != null
                                  ? NetworkImage(
                                      widget.user!['avatar'].toString().startsWith('http')
                                          ? widget.user!['avatar'].toString()
                                          : 'http://10.0.2.2:3000/${widget.user!['avatar']}',
                                    )
                                  : null,
                          child: _newAvatarFile == null && (widget.user == null || widget.user!['avatar'] == null)
                              ? const Icon(Icons.camera_alt, size: 50, color: Colors.white70)
                              : null,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Center(
                    child: Text(
                      'Nhấn để thay đổi ảnh đại diện',
                      style: TextStyle(color: Colors.black54, fontSize: 14.5, fontWeight: FontWeight.w500),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // FORM SIÊU HIỆN ĐẠI
                  Container(
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withAlpha(40),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        TextFormField(
                          controller: nameController,
                          decoration: InputDecoration(
                            labelText: 'Họ và tên',
                            prefixIcon: Icon(Icons.person_outline, color: deepBlue),
                            filled: true,
                            fillColor: pastelBlue.withAlpha(38), // ~0.15
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(18),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) return 'Vui lòng nhập họ tên';
                            if (value.trim().length < 2) return 'Họ tên quá ngắn';
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        TextFormField(
                          controller: phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: InputDecoration(
                            labelText: 'Số điện thoại',
                            prefixIcon: Icon(Icons.phone_android_outlined, color: deepBlue),
                            filled: true,
                            fillColor: pastelBlue.withAlpha(38),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(18),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          validator: (value) {
                            if (value != null && value.isNotEmpty && !RegExp(r'^\d{10}$').hasMatch(value)) {
                              return 'Số điện thoại phải có 10 chữ số';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        TextFormField(
                          controller: dobController,
                          decoration: InputDecoration(
                            labelText: 'Ngày sinh (YYYY-MM-DD)',
                            hintText: 'Ví dụ: 1995-06-15',
                            prefixIcon: Icon(Icons.calendar_today_outlined, color: deepBlue),
                            filled: true,
                            fillColor: pastelBlue.withAlpha(38),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(18),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          keyboardType: TextInputType.datetime,
                          onChanged: (_) => setState(() {}),
                          validator: (value) {
                            if (value == null || value.isEmpty) return 'Vui lòng nhập ngày sinh';
                            if (!_isValidDateFormat(value)) return 'Định dạng: YYYY-MM-DD';
                            try {
                              DateTime.parse(value);
                            } catch (_) {
                              return 'Ngày không hợp lệ';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        DropdownButtonFormField<String>(
                          value: genderController.text.isNotEmpty ? genderController.text : 'Khác',
                          decoration: InputDecoration(
                            labelText: 'Giới tính',
                            prefixIcon: Icon(Icons.wc_outlined, color: deepBlue),
                            filled: true,
                            fillColor: pastelBlue.withAlpha(38),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(18),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          items: genderMap.keys
                              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                              .toList(),
                          onChanged: (val) => setState(() => genderController.text = val!),
                          validator: (val) => val == null ? 'Vui lòng chọn giới tính' : null,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 40),

                  // NÚT LƯU – ĐỒNG BỘ MÀU CHÍNH
                  SizedBox(
                    width: double.infinity,
                    height: 60,
                    child: ElevatedButton(
                      onPressed: state.isLoading ? null : _saveProfile,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryBlue,
                        foregroundColor: Colors.white,
                        elevation: 10,
                        shadowColor: primaryBlue.withAlpha(128), // ~0.5
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      child: state.isLoading
                          ? const SizedBox(
                              height: 26,
                              width: 26,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                            )
                          : const Text(
                              'Lưu thay đổi',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 0.6),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}