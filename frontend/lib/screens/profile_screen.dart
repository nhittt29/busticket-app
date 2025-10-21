import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/home/home_bloc.dart';
import '../bloc/home/home_state.dart';
import '../bloc/home/home_event.dart';
import 'profile_detail_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final homeBloc = BlocProvider.of<HomeBloc>(context, listen: false);
    homeBloc.add(LoadUserEvent());

    return BlocProvider.value(
      value: homeBloc,
      child: Scaffold(
        backgroundColor: const Color(0xFFEAF6FF), // ✅ BACKGROUND XÁC NHẬN
        appBar: AppBar(
          backgroundColor: const Color(0xFF4CAF50), // ✅ HEADER XANH LÁ
          elevation: 0,
          centerTitle: true,
          title: const Text(
            "Tài khoản",
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 22,
            ),
          ),
          foregroundColor: Colors.white,
        ),
        body: BlocConsumer<HomeBloc, HomeState>(
          listener: (context, state) {
            if (!state.loading && state.user == null) {
              if (state.error != null) {
                if (kDebugMode) print('Error loading user: ${state.error}');
              }
              // Tạm thời không điều hướng tới login để kiểm tra
              // Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
            }
          },
          builder: (context, state) {
            if (state.loading) {
              return const Center(child: CircularProgressIndicator());
            }

            final user = state.user;
            if (user == null) {
              return const Center(child: Text("Không tìm thấy thông tin tài khoản"));
            }

            final email = user['email'] ?? '';
            final name = user['name'] ?? '';
            String? avatarUrl = user['avatar'];

            if (avatarUrl != null && avatarUrl.isNotEmpty) {
              avatarUrl = avatarUrl.replaceAll("\\", "/");
              if (!avatarUrl.startsWith('http')) {
                avatarUrl = 'http://10.0.2.2:3000/$avatarUrl';
              }
            } else {
              avatarUrl = 'assets/images/default.png';
            }

            return SingleChildScrollView(
              padding: const EdgeInsets.all(24), // ✅ TĂNG PADDING
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),
                  
                  // User Info Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.15),
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.grey.withOpacity(0.3), 
                              width: 2
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.1),
                                blurRadius: 5,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: ClipOval(
                            child: FadeInImage.assetNetwork(
                              placeholder: 'assets/images/default.png',
                              image: avatarUrl ?? 'assets/images/default.png',
                              width: 80,
                              height: 80,
                              fit: BoxFit.cover,
                              imageErrorBuilder: (context, error, stackTrace) {
                                if (kDebugMode) print('Avatar load error: $error');
                                return Image.asset(
                                  'assets/images/default.png',
                                  width: 80,
                                  height: 80,
                                  fit: BoxFit.cover,
                                );
                              },
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name.isNotEmpty ? name : "Khách hàng",
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF023E8A), // ✅ XANH ĐẬM
                                ),
                                textAlign: TextAlign.left,
                              ),
                              if (email.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Text(
                                    email,
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey.shade600,
                                    ),
                                    textAlign: TextAlign.left,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),

                  _buildSectionHeader("Thông tin thành viên"),
                  _buildMenuItem(
                    icon: Icons.person_outline,
                    label: "Hồ sơ thành viên",
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ProfileDetailScreen(user: state.user),
                        ),
                      );
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.history,
                    label: "Lịch sử đặt vé",
                    onTap: () => Navigator.pushNamed(context, '/ticket-history'),
                  ),

                  const SizedBox(height: 20),

                  _buildSectionHeader("Thông tin chung"),
                  _buildMenuItem(
                    icon: Icons.help_outline,
                    label: "Câu hỏi thường gặp",
                    onTap: () => Navigator.pushNamed(context, '/faq'),
                  ),
                  _buildMenuItem(
                    icon: Icons.privacy_tip_outlined,
                    label: "Chính sách bảo mật thông tin",
                    onTap: () => Navigator.pushNamed(context, '/privacy'),
                  ),

                  const SizedBox(height: 20),

                  _buildSectionHeader("Quản lý vé và thông báo"),
                  _buildMenuItem(
                    icon: Icons.confirmation_number,
                    label: "Quản lý vé",
                    onTap: () => Navigator.pushNamed(context, '/ticket-management'),
                  ),
                  _buildMenuItem(
                    icon: Icons.notifications,
                    label: "Thông báo",
                    onTap: () => Navigator.pushNamed(context, '/notifications'),
                  ),

                  const SizedBox(height: 20),

                  _buildSectionHeader("Khác"),
                  _buildMenuItem(
                    icon: Icons.logout,
                    label: "Đăng xuất",
                    iconColor: Colors.redAccent,
                    textColor: Colors.redAccent,
                    onTap: () => homeBloc.add(LogoutEvent()),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 8, left: 4),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Color(0xFF023E8A), // ✅ XANH ĐẬM
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color iconColor = const Color(0xFF0077B6), // ✅ XANH DƯƠNG
    Color textColor = const Color(0xFF023E8A), // ✅ XANH ĐẬM
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 2),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        leading: Icon(icon, color: iconColor, size: 24),
        title: Text(
          label,
          style: TextStyle(
            fontSize: 16,
            color: textColor,
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: const Icon(
          Icons.chevron_right, 
          color: Color(0xFF0077B6), // ✅ XANH DƯƠNG
          size: 24
        ),
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    );
  }
}