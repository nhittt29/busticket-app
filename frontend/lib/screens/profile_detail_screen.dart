// lib/screens/profile_detail_screen.dart
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
            "Hồ sơ tài khoản",
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
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

            // Xử lý ngày sinh – chỉ lấy YYYY-MM-DD
            String dob = 'Chưa cập nhật ngày sinh';
            final dobValue = userData['dob'];
            if (dobValue != null) {
              if (dobValue is DateTime) {
                dob = '${dobValue.year.toString().padLeft(4, '0')}-${dobValue.month.toString().padLeft(2, '0')}-${dobValue.day.toString().padLeft(2, '0')}';
              } else if (dobValue is String && dobValue.isNotEmpty) {
                try {
                  final parsed = DateTime.parse(dobValue);
                  dob = '${parsed.year.toString().padLeft(4, '0')}-${parsed.month.toString().padLeft(2, '0')}-${parsed.day.toString().padLeft(2, '0')}';
                } catch (e) {
                  if (dobValue.contains('T')) {
                    dob = dobValue.split('T')[0];
                  } else {
                    dob = dobValue;
                  }
                }
              }
            }

            final genderDisplay = _getGenderDisplay(userData['gender'] ?? 'OTHER');
            final avatarUrl = userData['avatar'] ?? 'assets/images/default.png';

            return SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),

                  // AVATAR CARD – HIỆN ĐẠI & ĐỒNG BỘ
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFA0D8F1).withOpacity(0.6), width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withAlpha(40),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF6AB7F5), width: 4),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF6AB7F5).withAlpha(102), // 0.4
                                blurRadius: 12,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ClipOval(
                            child: Image.network(
                              avatarUrl,
                              width: 110,
                              height: 110,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Image.asset(
                                  'assets/images/default.png',
                                  width: 110,
                                  height: 110,
                                  fit: BoxFit.cover,
                                );
                              },
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Text(
                          name,
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF023E8A),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 40),

                  // 4 CARD THÔNG TIN – ĐÃ ĐƯỢC THU NHỎ, GỌN ĐẸP, THANH THOÁT
                  _buildInfoCard(Icons.email_outlined, 'Email', email),
                  const SizedBox(height: 10),
                  _buildInfoCard(Icons.phone_android_outlined, 'Số điện thoại', phone),
                  const SizedBox(height: 10),
                  _buildInfoCard(Icons.calendar_today_outlined, 'Ngày sinh', dob),
                  const SizedBox(height: 10),
                  _buildInfoCard(Icons.wc_outlined, 'Giới tính', genderDisplay),

                  const SizedBox(height: 50),

                  // NÚT CẬP NHẬT
                  SizedBox(
                    width: double.infinity,
                    height: 56,
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
                        backgroundColor: const Color(0xFF6AB7F5),
                        foregroundColor: Colors.white,
                        elevation: 6,
                        shadowColor: const Color(0xFF6AB7F5).withAlpha(128), // 0.5
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text(
                        'Cập nhật thông tin',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
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

  String _getGenderDisplay(String backendGender) {
    switch (backendGender) {
      case 'MALE':
        return 'Nam';
      case 'FEMALE':
        return 'Nữ';
      case 'OTHER':
      default:
        return 'Khác';
    }
  }

  // CARD THÔNG TIN ĐÃ ĐƯỢC TỐI ƯU – GỌN, ĐẸP, TINH TẾ
  Widget _buildInfoCard(IconData icon, String title, String value) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 5),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFA0D8F1).withOpacity(0.4), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withAlpha(25),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: const Color(0xFFA0D8F1).withOpacity(0.25),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF1976D2), size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13.5,
                    color: Colors.black54,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.black87,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}