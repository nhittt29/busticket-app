import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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
    // Chuyển giá trị gender từ backend sang hiển thị tiếng Việt
    final backendGender = user['gender'] ?? 'OTHER';
    genderController = TextEditingController(
      text: genderMap.entries
          .firstWhere((entry) => entry.value == backendGender,
              orElse: () => const MapEntry('Khác', 'OTHER'))
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF), // ✅ BACKGROUND XÁC NHẬN
      appBar: AppBar(
        title: const Text('Chỉnh sửa thông tin'),
        backgroundColor: const Color(0xFF4CAF50), // ✅ HEADER XANH LÁ PHÙ HỢP
        elevation: 2,
        foregroundColor: Colors.white, // Text màu trắng
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
                  )
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
                    value: genderController.text,
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

            // Save Button - ĐỔI MÀU XANH LÁ PHÙ HỢP
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
                  // Chuyển giá trị hiển thị tiếng Việt sang giá trị backend
                  final backendGender = genderMap[genderController.text] ?? 'OTHER';
                  
                  authBloc.add(UpdateUserEvent(
                    name: nameController.text,
                    phone: phoneController.text.isEmpty ? null : phoneController.text,
                    dob: dob,
                    gender: backendGender,
                  ));
                  
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50), // ✅ BUTTON XANH LÁ
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