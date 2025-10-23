import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';

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
      backgroundColor: const Color(0xFFEAF6FF),
      appBar: AppBar(
        title: const Text('Đăng ký'),
        backgroundColor: Colors.white,
        elevation: 2,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 5),
          child: BlocListener<AuthBloc, AuthState>(
            listener: (context, state) {
              if (state.error != null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(state.error!), backgroundColor: Colors.red),
                );
              } else if (state.success && state.message == "Đăng ký thành công") {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
            child: BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                return Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    // Avatar Picker - GIẢM 70→60
                    GestureDetector(
                      onTap: _pickAvatar,
                      child: CircleAvatar(
                        radius: 60,
                        backgroundColor: const Color(0xFFBFD7ED),
                        backgroundImage: _avatarFile != null ? FileImage(_avatarFile!) : null,
                        child: _avatarFile == null
                            ? const Icon(Icons.camera_alt, size: 35, color: Colors.white)
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
                        color: Color(0xFF023E8A),
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 5),
                    const Text(
                      'Tạo tài khoản mới',
                      style: TextStyle(fontSize: 16, color: Colors.black87),
                    ),
                    const SizedBox(height: 16),

                    // Form Container - NHỎ LẠI
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.15),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
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
                                prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF0077B6)),
                                filled: true,
                                fillColor: const Color(0xFFF7F9FB),
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
                                prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF0077B6)),
                                filled: true,
                                fillColor: const Color(0xFFF7F9FB),
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
                                prefixIcon: const Icon(Icons.person_outline, color: Color(0xFF0077B6)),
                                filled: true,
                                fillColor: const Color(0xFFF7F9FB),
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
                                prefixIcon: const Icon(Icons.phone, color: Color(0xFF0077B6)),
                                filled: true,
                                fillColor: const Color(0xFFF7F9FB),
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
                                prefixIcon: const Icon(Icons.calendar_today, color: Color(0xFF0077B6)),
                                filled: true,
                                fillColor: const Color(0xFFF7F9FB),
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
                              decoration: InputDecoration(
                                labelText: 'Giới tính',
                                prefixIcon: const Icon(Icons.wc, color: Color(0xFF0077B6)),
                                filled: true,
                                fillColor: const Color(0xFFF7F9FB),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                              value: gender,
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

                            // Register Button - NHỎ LẠI
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF0077B6),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
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
                                              const SnackBar(
                                                content: Text('Định dạng ngày sinh không hợp lệ'),
                                                backgroundColor: Colors.red,
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
                                    ? const CircularProgressIndicator(color: Colors.white)
                                    : const Text(
                                        'Đăng ký',
                                        style: TextStyle(fontSize: 16, color: Colors.white),
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
                          child: const Text(
                            'Đăng nhập',
                            style: TextStyle(color: Color(0xFF0077B6)),
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