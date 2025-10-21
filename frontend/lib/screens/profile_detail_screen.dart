import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:http/http.dart' as http; // Thêm import http
import 'dart:convert'; // Thêm import convert

class ProfileDetailScreen extends StatefulWidget {
  final Map<String, dynamic>? user;

  const ProfileDetailScreen({super.key, this.user});

  @override
  State<ProfileDetailScreen> createState() => _ProfileDetailScreenState();
}

class _ProfileDetailScreenState extends State<ProfileDetailScreen> {
  late Map<String, dynamic> user;
  File? _selectedImage;

  @override
  void initState() {
    super.initState();
    user = widget.user ?? {};
    _selectedImage = user['avatar'] != null && user['avatar'].toString().startsWith('http')
        ? null
        : File(user['avatar'] ?? 'assets/images/default.png');
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
      });
      // Gọi API để cập nhật avatar
      await _updateAvatar(pickedFile.path);
    }
  }

  Future<void> _updateAvatar(String imagePath) async {
    final url = Uri.parse('http://10.0.2.2:3000/auth/update-avatar'); // Giả định endpoint
    final token = 'your-auth-token'; // Lấy từ AuthBloc hoặc SharedPreferences

    try {
      final request = http.MultipartRequest('PUT', url)
        ..headers['Authorization'] = 'Bearer $token'
        ..fields['id'] = user['id'].toString() // Giả định user có id
        ..files.add(await http.MultipartFile.fromPath('avatar', imagePath));

      final response = await request.send();
      if (response.statusCode == 200) {
        if (!mounted) return;
        final responseBody = await response.stream.bytesToString();
        final updatedUser = jsonDecode(responseBody);
        setState(() {
          user = updatedUser;
          _selectedImage = null; // Reset sau khi cập nhật thành công
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật ảnh đại diện thành công!')),
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật thất bại, vui lòng thử lại!')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi kết nối, vui lòng thử lại!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = user['name'] ?? 'Không có tên';
    final email = user['email'] ?? 'Không có email';
    final phone = user['phone'] ?? 'Chưa cập nhật số điện thoại';
    final dob = user['dob'] ?? 'Chưa cập nhật ngày sinh';
    final gender = user['gender'] ?? 'Chưa cập nhật giới tính';
    final avatarUrl = user['avatar'] ?? 'assets/images/default.png';

    return Scaffold(
      backgroundColor: const Color(0xFFEAF6FF),
      appBar: AppBar(
        backgroundColor: Colors.redAccent,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "Hồ sơ thành viên",
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.grey.withValues(alpha: 0.3), width: 1), // Thay withOpacity bằng withValues
                        ),
                        child: ClipOval(
                          child: _selectedImage != null
                              ? Image.file(
                                  _selectedImage!,
                                  width: 100,
                                  height: 100,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Image.asset(
                                      'assets/images/default.png',
                                      width: 100,
                                      height: 100,
                                      fit: BoxFit.cover,
                                    );
                                  },
                                )
                              : (avatarUrl.startsWith('http')
                                  ? Image.network(
                                      avatarUrl,
                                      width: 100,
                                      height: 100,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return Image.asset(
                                          'assets/images/default.png',
                                          width: 100,
                                          height: 100,
                                          fit: BoxFit.cover,
                                        );
                                      },
                                    )
                                  : Image.asset(
                                      avatarUrl,
                                      width: 100,
                                      height: 100,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return Image.asset(
                                          'assets/images/default.png',
                                          width: 100,
                                          height: 100,
                                          fit: BoxFit.cover,
                                        );
                                      },
                                    )),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      name,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                title: const Text(
                  'Email',
                  style: TextStyle(fontWeight: FontWeight.w500, color: Colors.black54),
                ),
                subtitle: Text(
                  email,
                  style: const TextStyle(fontSize: 16, color: Colors.black87),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
            ),
            const SizedBox(height: 10),
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                title: const Text(
                  'Số điện thoại',
                  style: TextStyle(fontWeight: FontWeight.w500, color: Colors.black54),
                ),
                subtitle: Text(
                  phone,
                  style: const TextStyle(fontSize: 16, color: Colors.black87),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
            ),
            const SizedBox(height: 10),
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                title: const Text(
                  'Ngày sinh',
                  style: TextStyle(fontWeight: FontWeight.w500, color: Colors.black54),
                ),
                subtitle: Text(
                  dob,
                  style: const TextStyle(fontSize: 16, color: Colors.black87),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
            ),
            const SizedBox(height: 10),
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                title: const Text(
                  'Giới tính',
                  style: TextStyle(fontWeight: FontWeight.w500, color: Colors.black54),
                ),
                subtitle: Text(
                  gender,
                  style: const TextStyle(fontSize: 16, color: Colors.black87),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Chức năng cập nhật sẽ được triển khai!')),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text(
                'Cập nhật thông tin',
                style: TextStyle(color: Colors.white, fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}