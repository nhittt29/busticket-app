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
const Color deepBlue = Color(0xFF1976D4);
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
            fontSize: 23,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 5),
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
            child: BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                return Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    // Avatar Picker
                    GestureDetector(
                      onTap: _pickAvatar,
                      child: CircleAvatar(
                        radius: 60,
                        backgroundColor: pastelBlue.withAlpha(150),
                        backgroundImage: _avatarFile != null ? FileImage(_avatarFile!) : null,
                        child: _avatarFile == null
                            ? Icon(Icons.camera_alt, size: 35, color: Colors.white.withAlpha(220))
                            : null,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Chọn ảnh đại diện',
                      style: TextStyle(color: Colors.black54, fontSize: 14),
                    ),
                    const SizedBox(height: 16),

                    // Logo & Title
                    const Text(
                      'BUSTICKET',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: deepBlue,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 5),
                    const Text(
                      'Tạo tài khoản mới',
                      style: TextStyle(fontSize: 16, color: Colors.black87),
                    ),
                    const SizedBox(height: 16),

                    // Form Container
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withAlpha(60),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            // Email
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Email',
                                prefixIcon: Icon(Icons.email_outlined, color: deepBlue),
                                filled: true,
                                fillColor: pastelBlue.withAlpha(50),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                              style: const TextStyle(color: Colors.black),
                              onChanged: (value) => email = value,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Bắt buộc nhập email';
                                }
                                if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                                  return 'Email không hợp lệ';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),

                            // Password
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Mật khẩu',
                                prefixIcon: Icon(Icons.lock_outline, color: deepBlue),
                                filled: true,
                                fillColor: pastelBlue.withAlpha(50),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                              obscureText: true,
                              style: const TextStyle(color: Colors.black),
                              onChanged: (value) => password = value,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Bắt buộc nhập mật khẩu';
                                }
                                if (!RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')
                                    .hasMatch(value)) {
                                  return 'Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),

                            // Name
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Họ và tên',
                                prefixIcon: Icon(Icons.person_outline, color: deepBlue),
                                filled: true,
                                fillColor: pastelBlue.withAlpha(50),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                              style: const TextStyle(color: Colors.black),
                              onChanged: (value) => name = value,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Bắt buộc nhập họ tên';
                                }
                                if (value.length < 2 || value.length > 50) {
                                  return 'Họ tên phải từ 2 đến 50 ký tự';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),

                            // Phone
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Số điện thoại',
                                prefixIcon: Icon(Icons.phone, color: deepBlue),
                                filled: true,
                                fillColor: pastelBlue.withAlpha(50),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                              keyboardType: TextInputType.phone,
                              style: const TextStyle(color: Colors.black),
                              onChanged: (value) => phone = value,
                              validator: (value) {
                                if (value != null && value.isNotEmpty) {
                                  if (!RegExp(r'^\d{10}$').hasMatch(value)) {
                                    return 'Số điện thoại phải là 10 chữ số';
                                  }
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),

                            // Date of Birth
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Ngày sinh (YYYY-MM-DD)',
                                prefixIcon: Icon(Icons.calendar_today, color: deepBlue),
                                filled: true,
                                fillColor: pastelBlue.withAlpha(50),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                              keyboardType: TextInputType.datetime,
                              style: const TextStyle(color: Colors.black),
                              onChanged: (value) => dob = value,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Bắt buộc nhập ngày sinh';
                                }
                                if (!RegExp(r'^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$').hasMatch(value)) {
                                  return 'Định dạng ngày phải là YYYY-MM-DD';
                                }
                                try {
                                  DateTime.parse(value);
                                } catch (e) {
                                  return 'Ngày sinh không hợp lệ';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),

                            // Gender Dropdown
                            DropdownButtonFormField<String>(
                              value: gender,
                              decoration: InputDecoration(
                                labelText: 'Giới tính',
                                prefixIcon: Icon(Icons.wc, color: deepBlue),
                                filled: true,
                                fillColor: pastelBlue.withAlpha(50),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                              items: const [
                                DropdownMenuItem(value: 'MALE', child: Text('Nam')),
                                DropdownMenuItem(value: 'FEMALE', child: Text('Nữ')),
                                DropdownMenuItem(value: 'OTHER', child: Text('Khác')),
                              ],
                              onChanged: (value) {
                                if (value != null) {
                                  setState(() => gender = value);
                                }
                              },
                              validator: (value) => value == null ? 'Bắt buộc chọn giới tính' : null,
                            ),
                            const SizedBox(height: 16),

                            // Register Button
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: primaryBlue,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
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
                                          } catch (e) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(
                                                content: const Text('Định dạng ngày sinh không hợp lệ'),
                                                backgroundColor: Colors.redAccent,
                                                behavior: SnackBarBehavior.floating,
                                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                                margin: const EdgeInsets.all(16),
                                              ),
                                            );
                                            return;
                                          }

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
                                    ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 3)
                                    : const Text(
                                        'Đăng ký',
                                        style: TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.bold),
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Login Link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Đã có tài khoản? ',
                          style: TextStyle(color: Colors.black87),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: Text(
                            'Đăng nhập',
                            style: TextStyle(color: primaryBlue, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}