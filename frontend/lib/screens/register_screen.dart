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
                Navigator.pushReplacementNamed(context, '/login'); // Quay lại LoginScreen
              }
            },
            child: BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                return Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    GestureDetector(
                      onTap: _pickAvatar,
                      child: CircleAvatar(
                        radius: 70,
                        backgroundColor: const Color(0xFFBFD7ED),
                        backgroundImage: _avatarFile != null ? FileImage(_avatarFile!) : null,
                        child: _avatarFile == null
                            ? const Icon(Icons.camera_alt, size: 40, color: Colors.white)
                            : null,
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text('Chọn ảnh đại diện', style: TextStyle(color: Colors.black54, fontSize: 14)),
                    const SizedBox(height: 20),
                    const Text('BUSTICKET', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF023E8A), letterSpacing: 0.5)),
                    const SizedBox(height: 5),
                    const Text('Tạo tài khoản mới', style: TextStyle(fontSize: 16, color: Colors.black87)),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.15), blurRadius: 10, offset: const Offset(0, 5))],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Email',
                                prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF0077B6)),
                                filled: true,
                                fillColor: const Color(0xFFF7F9FB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                              ),
                              style: const TextStyle(color: Colors.black),
                              onChanged: (value) => email = value,
                              validator: (value) => value != null && value.contains('@') ? null : 'Email không hợp lệ',
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Mật khẩu',
                                prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF0077B6)),
                                filled: true,
                                fillColor: const Color(0xFFF7F9FB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                              ),
                              obscureText: true,
                              style: const TextStyle(color: Colors.black),
                              onChanged: (value) => password = value,
                              validator: (value) => value != null && value.length >= 8 ? null : 'Mật khẩu tối thiểu 8 ký tự',
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Họ và tên',
                                prefixIcon: const Icon(Icons.person_outline, color: Color(0xFF0077B6)),
                                filled: true,
                                fillColor: const Color(0xFFF7F9FB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                              ),
                              style: const TextStyle(color: Colors.black),
                              onChanged: (value) => name = value,
                              validator: (value) => value != null && value.isNotEmpty ? null : 'Bắt buộc nhập họ tên',
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              decoration: InputDecoration(
                                labelText: 'Số điện thoại',
                                prefixIcon: const Icon(Icons.phone, color: Color(0xFF0077B6)),
                                filled: true,
                                fillColor: const Color(0xFFF7F9FB),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                              ),
                              keyboardType: TextInputType.phone,
                              style: const TextStyle(color: Colors.black),
                              onChanged: (value) => phone = value,
                              validator: (value) => value != null && value.length >= 10 && RegExp(r'^[0-9]+$').hasMatch(value) ? null : 'Số điện thoại không hợp lệ',
                            ),
                            const SizedBox(height: 20),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF0077B6),
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                onPressed: state.isLoading
                                    ? null
                                    : () {
                                        if (_formKey.currentState!.validate()) {
                                          context.read<AuthBloc>().add(RegisterEvent(email, password, name, phone, avatarPath: _avatarFile?.path));
                                        }
                                      },
                                child: state.isLoading
                                    ? const CircularProgressIndicator(color: Colors.white)
                                    : const Text('Đăng ký', style: TextStyle(fontSize: 17, color: Colors.white)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('Đã có tài khoản? ', style: TextStyle(color: Colors.black87)),
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Đăng nhập', style: TextStyle(color: Color(0xFF0077B6))),
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