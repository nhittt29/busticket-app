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

  final Map<String, String> genderMap = {
    'Nam': 'MALE',
    'Nữ': 'FEMALE',
    'Khác': 'OTHER',
  };

  @override
  void initState() {
    super.initState();
    final user = widget.user ?? {};
    // Xử lý dob để luôn lấy phần YYYY-MM-DD
    final dobValue = user['dob'];
    String initialDob = '';
    if (dobValue != null) {
      if (dobValue is DateTime) {
        initialDob = dobValue.toIso8601String().split('T')[0];
      } else if (dobValue is String) {
        initialDob = dobValue.split('T')[0]; // Lấy phần trước T
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
      final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
      if (pickedFile != null) {
        setState(() => _newAvatarFile = File(pickedFile.path));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không chọn được ảnh, vui lòng thử lại.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi khi chọn ảnh: $e')),
      );
    }
  }

  bool _isValidDateFormat(String date) {
    final RegExp dateRegex = RegExp(r'^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$');
    return dateRegex.hasMatch(date);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF),
      appBar: AppBar(
        title: const Text('Chỉnh sửa thông tin'),
        backgroundColor: const Color(0xFF4CAF50),
        elevation: 2,
        foregroundColor: Colors.white,
      ),
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state.success && state.message != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message!)),
            );
          } else if (state.error != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.error!)),
            );
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: GestureDetector(
                  onTap: _pickAvatar,
                  child: CircleAvatar(
                    radius: 70,
                    backgroundColor: const Color(0xFFBFD7ED),
                    backgroundImage: _newAvatarFile != null
                        ? FileImage(_newAvatarFile!)
                        : widget.user?['avatar'] != null
                            ? NetworkImage(widget.user!['avatar'].toString())
                            : null,
                    child: _newAvatarFile == null && (widget.user?['avatar'] == null)
                        ? const Icon(Icons.camera_alt, size: 40, color: Colors.white)
                        : null,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Center(
                child: const Text(
                  'Nhấn để chọn ảnh đại diện',
                  style: TextStyle(color: Colors.black54, fontSize: 14),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.15),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    TextFormField(
                      controller: nameController,
                      decoration: InputDecoration(
                        labelText: 'Họ và tên',
                        prefixIcon: const Icon(Icons.person_outline, color: Color(0xFF0077B6)),
                        filled: true,
                        fillColor: const Color(0xFFF7F9FB),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        errorStyle: const TextStyle(color: Colors.redAccent),
                      ),
                      style: const TextStyle(color: Colors.black),
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
                    const SizedBox(height: 20),
                    TextFormField(
                      controller: phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: 'Số điện thoại',
                        prefixIcon: const Icon(Icons.phone, color: Color(0xFF0077B6)),
                        filled: true,
                        fillColor: const Color(0xFFF7F9FB),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        errorStyle: const TextStyle(color: Colors.redAccent),
                      ),
                      style: const TextStyle(color: Colors.black),
                      validator: (value) {
                        if (value != null && value.isNotEmpty) {
                          if (!RegExp(r'^\d{10}$').hasMatch(value)) {
                            return 'Số điện thoại phải là 10 chữ số';
                          }
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 20),
                    TextFormField(
                      controller: dobController,
                      decoration: InputDecoration(
                        labelText: 'Ngày sinh (YYYY-MM-DD)',
                        prefixIcon: const Icon(Icons.calendar_today, color: Color(0xFF0077B6)),
                        filled: true,
                        fillColor: const Color(0xFFF7F9FB),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        errorText: _isValidDateFormat(dobController.text)
                            ? null
                            : 'Vui lòng nhập đúng định dạng YYYY-MM-DD',
                      ),
                      style: const TextStyle(color: Colors.black),
                      keyboardType: TextInputType.datetime,
                      onChanged: (value) => setState(() {}), // Cập nhật lỗi khi nhập
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Bắt buộc nhập ngày sinh';
                        }
                        if (!_isValidDateFormat(value)) {
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
                    const SizedBox(height: 20),
                    DropdownButtonFormField<String>(
                      value: genderController.text.isNotEmpty
                          ? genderController.text
                          : 'Khác',
                      decoration: InputDecoration(
                        labelText: 'Giới tính',
                        prefixIcon: const Icon(Icons.wc, color: Color(0xFF0077B6)),
                        filled: true,
                        fillColor: const Color(0xFFF7F9FB),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        errorStyle: const TextStyle(color: Colors.redAccent),
                      ),
                      items: genderMap.keys.map((String displayValue) {
                        return DropdownMenuItem<String>(
                          value: displayValue,
                          child: Text(displayValue),
                        );
                      }).toList(),
                      onChanged: (String? newDisplayValue) {
                        if (newDisplayValue != null) {
                          setState(() {
                            genderController.text = newDisplayValue;
                          });
                        }
                      },
                      validator: (value) => value == null ? 'Bắt buộc chọn giới tính' : null,
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (Form.of(context)?.validate() ?? false) {
                      final authBloc = context.read<AuthBloc>();
                      DateTime? dob;
                      try {
                        dob = DateTime.parse(dobController.text);
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Ngày sinh không hợp lệ')),
                        );
                        return;
                      }
                      final backendGender = genderMap[genderController.text] ?? 'OTHER';
                      authBloc.add(UpdateUserEvent(
                        name: nameController.text,
                        phone: phoneController.text.isEmpty ? null : phoneController.text,
                        dob: dob,
                        gender: backendGender,
                        avatarPath: _newAvatarFile?.path,
                      ));
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4CAF50),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Lưu thay đổi',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}