import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_event.dart';
import '../bloc/auth/auth_state.dart';
import 'edit_profile_screen.dart';

class ProfileDetailScreen extends StatelessWidget {
  final Map<String, dynamic>? user;

  const ProfileDetailScreen({super.key, this.user});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AuthBloc()..add(LoadUserEvent()),
      child: Scaffold(
        backgroundColor: const Color(0xFFEAF6FF), // ✅ BACKGROUND XÁC NHẬN
        appBar: AppBar(
          backgroundColor: const Color(0xFF4CAF50), // ✅ HEADER XANH LÁ
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
          foregroundColor: Colors.white,
        ),
        body: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            if (state.isLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            
            final userData = state.user ?? user ?? {};
            final name = userData['name'] ?? 'Không có tên';
            final email = userData['email'] ?? 'Không có email';
            final phone = userData['phone'] ?? 'Chưa cập nhật số điện thoại';
            final dob = userData['dob'] != null
                ? (userData['dob'] is DateTime
                    ? (userData['dob'] as DateTime).toIso8601String().split('T')[0]
                    : userData['dob'].toString())
                : 'Chưa cập nhật ngày sinh';
            final genderDisplay = _getGenderDisplay(userData['gender'] ?? 'OTHER');
            final avatarUrl = userData['avatar'] ?? 'assets/images/default.png';

            return SingleChildScrollView(
              padding: const EdgeInsets.all(24), // ✅ TĂNG PADDING
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),
                  
                  // Avatar Card
                  Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.grey.withOpacity(0.3),
                                width: 2,
                              ),
                            ),
                            child: ClipOval(
                              child: Image.network(
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
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF023E8A),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 30),
                  
                  // Info Cards
                  _buildInfoCard(Icons.email_outlined, 'Email', email),
                  const SizedBox(height: 12),
                  _buildInfoCard(Icons.phone, 'Số điện thoại', phone),
                  const SizedBox(height: 12),
                  _buildInfoCard(Icons.calendar_today, 'Ngày sinh', dob),
                  const SizedBox(height: 12),
                  _buildInfoCard(Icons.wc, 'Giới tính', genderDisplay),
                  
                  const SizedBox(height: 40),
                  
                  // Edit Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => EditProfileScreen(user: userData),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF4CAF50), // ✅ BUTTON XANH LÁ
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 2,
                      ),
                      child: const Text(
                        'Cập nhật thông tin',
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
            );
          },
        ),
      ),
    );
  }

  // Helper method để hiển thị giới tính tiếng Việt
  String _getGenderDisplay(String backendGender) {
    switch (backendGender) {
      case 'MALE':
        return 'Nam';
      case 'FEMALE':
        return 'Nữ';
      case 'OTHER':
        return 'Khác';
      default:
        return 'Khác';
    }
  }

  // Helper method để tạo Info Card đồng bộ
  Widget _buildInfoCard(IconData icon, String title, String value) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF0077B6)),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: Colors.black54,
            fontSize: 14,
          ),
        ),
        subtitle: Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            color: Colors.black87,
            fontWeight: FontWeight.w500,
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      ),
    );
  }
}