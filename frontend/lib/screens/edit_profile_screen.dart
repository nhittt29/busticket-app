import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';

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
  File? _newAvatarFile; // Lưu ảnh mới được chọn
  final ImagePicker _picker = ImagePicker();

  // Mapping giữa hiển thị (tiếng Việt) và giá trị backend (MALE, FEMALE, OTHER)
  final Map<String, String> genderMap = {
    'Nam': 'MALE',
    'Nữ': 'FEMALE',
    'Khác': 'OTHER',
  };

  @override
  void initState() {
    super.initState();
    final user = widget.user ?? {};
    nameController = TextEditingController(text: user['name'] ?? '');
    phoneController = TextEditingController(text: user['phone'] ?? '');
    dobController = TextEditingController(
      text: user['dob'] != null
          ? (user['dob'] is DateTime
              ? (user['dob'] as DateTime).toIso8601String().split('T')[0]
              : user['dob'].toString())
          : '',
    );
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
        // Thông báo nếu không chọn được ảnh
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar Section
            Center(
              child: GestureDetector(
                onTap: _pickAvatar,
                child: CircleAvatar(
                  radius: 70,
                  backgroundColor: const Color(0xFFBFD7ED),
                  backgroundImage: _newAvatarFile != null
                      ? FileImage(_newAvatarFile!) // Ưu tiên ảnh mới
                      : widget.user?['avatar'] != null
                          ? NetworkImage(widget.user!['avatar'].toString()) // Hiển thị avatar hiện tại
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

            // Form Container
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
                  // Name Field
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
                    ),
                    style: const TextStyle(color: Colors.black),
                  ),
                  const SizedBox(height: 20),

                  // Phone Field
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
                    ),
                    style: const TextStyle(color: Colors.black),
                  ),
                  const SizedBox(height: 20),

                  // Date of Birth Field
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
                    ),
                    style: const TextStyle(color: Colors.black),
                  ),
                  const SizedBox(height: 20),

                  // Gender Dropdown
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
                  ),
                  const SizedBox(height: 30),
                ],
              ),
           ),

            const SizedBox(height: 30),

            // Save Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  final authBloc = context.read<AuthBloc>();
                  DateTime? dob;
                  try {
                    dob = DateTime.parse(dobController.text);
                  } catch (e) {
                    dob = null;
                  }

                  final backendGender = genderMap[genderController.text] ?? 'OTHER';

                  authBloc.add(UpdateUserEvent(
                    name: nameController.text,
                    phone: phoneController.text.isEmpty ? null : phoneController.text,
                    dob: dob,
                    gender: backendGender,
                    avatarPath: _newAvatarFile?.path,
                  ));

                  Navigator.pop(context);
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
    );
  }
}