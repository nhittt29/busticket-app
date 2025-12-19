// lib/auth/screens/register_screen.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';

const Color primaryBlue = Color(0xFF6AB7F5);
const Color accentBlue = Color(0xFF4A9EFF);
const Color deepBlue = Color(0xFF1976D2);
const Color pastelBlue = Color(0xFFA0D8F1);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color successGreen = Color(0xFF4CAF50);

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  String email = '';
  String password = '';
  String name = '';
  String phone = '';
  String dob = '';
  String gender = 'OTHER';
  File? _avatarFile;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickAvatar() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() => _avatarFile = File(pickedFile.path));
    }
  }

  @override
  Widget build(BuildContext context) {
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
          'Đăng ký',
          style: TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: BlocListener<AuthBloc, AuthState>(
            listener: (context, state) {
              if (state.error != null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(state.error!, style: const TextStyle(color: Colors.white)),
                    backgroundColor: Colors.redAccent,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    margin: const EdgeInsets.all(16),
                  ),
                );
              } else if (state.success && state.message == "Đăng ký thành công") {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text('Đăng ký thành công! Vui lòng đăng nhập', style: TextStyle(fontWeight: FontWeight.w600)),
                    backgroundColor: successGreen,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    margin: const EdgeInsets.all(16),
                  ),
                );
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Avatar (Compact)
                  GestureDetector(
                    onTap: _pickAvatar,
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 65,
                          backgroundColor: Colors.white,
                          child: CircleAvatar(
                            radius: 61,
                            backgroundColor: pastelBlue.withAlpha(100),
                            backgroundImage: _avatarFile != null ? FileImage(_avatarFile!) : null,
                            child: _avatarFile == null
                                ? Icon(Icons.camera_alt, size: 40, color: Colors.white.withOpacity(0.9))
                                : null,
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 4,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: primaryBlue,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.edit, size: 18, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 30),

                  // Compact Card Form
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: deepBlue.withAlpha(60),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'Tạo tài khoản mới',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: deepBlue,
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Name
                        _buildCompactField(
                          label: 'Họ và tên',
                          icon: Icons.person_outline,
                          onChanged: (v) => name = v,
                          validator: (v) => (v == null || v.isEmpty) ? 'Nhập họ tên' : null,
                        ),
                        const SizedBox(height: 12),

                        // Phone
                        _buildCompactField(
                          label: 'Số điện thoại',
                          icon: Icons.phone_android_outlined,
                          inputType: TextInputType.phone,
                          onChanged: (v) => phone = v,
                          validator: (v) => (v != null && !RegExp(r'^\d{10}$').hasMatch(v)) ? 'SDT 10 số' : null,
                        ),
                        const SizedBox(height: 12),

                        // Row: DOB + Gender
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              flex: 3,
                              child: _buildCompactField(
                                label: 'Ngày sinh',
                                hintText: 'YYYY-MM-DD',
                                icon: Icons.calendar_today_outlined,
                                inputType: TextInputType.datetime,
                                onChanged: (v) => dob = v,
                                validator: (v) {
                                   if (v == null || v.isEmpty) return 'Nhập ngày';
                                   if (!RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(v)) return 'YYYY-MM-DD';
                                   return null;
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              flex: 2,
                              child: DropdownButtonFormField<String>(
                                value: gender,
                                isExpanded: true,
                                decoration: InputDecoration(
                                  labelText: 'Giới tính',
                                  isDense: true,
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(color: Colors.grey.shade300),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(color: Colors.grey.shade300),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: const BorderSide(color: primaryBlue, width: 1.5),
                                  ),
                                  filled: true,
                                  fillColor: pastelBlue.withAlpha(50),
                                ),
                                icon: const Icon(Icons.arrow_drop_down, color: deepBlue),
                                items: const [
                                  DropdownMenuItem(value: 'MALE', child: Text('Nam', style: TextStyle(fontSize: 14))),
                                  DropdownMenuItem(value: 'FEMALE', child: Text('Nữ', style: TextStyle(fontSize: 14))),
                                  DropdownMenuItem(value: 'OTHER', child: Text('Khác', style: TextStyle(fontSize: 14))),
                                ],
                                onChanged: (v) => setState(() => gender = v!),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Email
                        _buildCompactField(
                          label: 'Email',
                          icon: Icons.email_outlined,
                          inputType: TextInputType.emailAddress,
                          onChanged: (v) => email = v,
                          validator: (v) => (v == null || !v.contains('@')) ? 'Email sai' : null,
                        ),
                        const SizedBox(height: 12),

                        // Password
                        _buildCompactField(
                          label: 'Mật khẩu',
                          icon: Icons.lock_outline,
                          obscure: true,
                          onChanged: (v) => password = v,
                          validator: (v) => (v == null || v.length < 6) ? 'Min 6 ký tự' : null,
                        ),
                        const SizedBox(height: 24),

                        // Register Button
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: BlocBuilder<AuthBloc, AuthState>(
                            builder: (context, state) {
                              return ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: primaryBlue,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  elevation: 8,
                                  shadowColor: primaryBlue.withAlpha(100),
                                ),
                                onPressed: state.isLoading
                                    ? null
                                    : () {
                                        if (_formKey.currentState!.validate()) {
                                          DateTime? dobDate;
                                          try {
                                            dobDate = DateTime.parse(dob);
                                          } catch (_) {}

                                          context.read<AuthBloc>().add(RegisterEvent(
                                            email,
                                            password,
                                            name,
                                            phone,
                                            avatarPath: _avatarFile?.path,
                                            dob: dobDate,
                                            gender: gender,
                                          ));
                                        }
                                      },
                                child: state.isLoading
                                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                    : const Text(
                                        'ĐĂNG KÝ',
                                        style: TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1),
                                      ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Login Link
                  Padding(
                    padding: const EdgeInsets.only(top: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Đã có tài khoản? ',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 15),
                        ),
                        GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Text(
                            'Đăng nhập ngay',
                            style: TextStyle(color: primaryBlue, fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCompactField({
    required String label,
    required IconData icon,
    required Function(String) onChanged,
    required String? Function(String?) validator,
    TextInputType inputType = TextInputType.text,
    bool obscure = false,
    String? hintText,
  }) {
    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        hintText: hintText,
        hintStyle: TextStyle(color: Colors.black38, fontSize: 13),
        prefixIcon: Icon(icon, color: deepBlue, size: 22),
        filled: true,
        fillColor: pastelBlue.withAlpha(50),
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryBlue, width: 1.5),
        ),
        errorStyle: const TextStyle(height: 0.8, fontSize: 12),
      ),
      style: const TextStyle(color: Colors.black87, fontSize: 15),
      keyboardType: inputType,
      obscureText: obscure,
      onChanged: onChanged,
      validator: validator,
    );
  }
}