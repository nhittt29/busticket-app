// lib/screens/profile_screen.dart
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
      child: PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) {
          if (!didPop) {
            Navigator.pop(context, 0);
          }
        },
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
              onPressed: () {
                Navigator.pop(context, 0);
              },
            ),
            title: const Text(
              "Tài khoản",
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
            actions: const [
              // Có thể thêm Settings sau
              // IconButton(icon: Icon(Icons.settings_outlined), onPressed: () {}),
            ],
          ),
          body: BlocConsumer<HomeBloc, HomeState>(
            listener: (context, state) {
              if (!state.loading && state.user == null && state.error != null) {
                if (kDebugMode) debugPrint('Error loading user: ${state.error}');
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
              String avatarUrl = user['avatar'] ?? '';

              if (avatarUrl.isNotEmpty) {
                avatarUrl = avatarUrl.replaceAll("\\", "/");
                if (!avatarUrl.startsWith('http')) {
                  avatarUrl = 'http://10.0.2.2:3000/$avatarUrl';
                }
              } else {
                avatarUrl = 'assets/images/default.png';
              }

              return SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 20),

                    // CARD THÔNG TIN USER – NÂNG CẤP ĐẸP HƠN
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFA0D8F1).withOpacity(0.5), width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withAlpha(38),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: const Color(0xFFA0D8F1), width: 3),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withAlpha(50),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: FadeInImage.assetNetwork(
                                placeholder: 'assets/images/default.png',
                                image: avatarUrl,
                                width: 84,
                                height: 84,
                                fit: BoxFit.cover,
                                imageErrorBuilder: (context, error, stackTrace) {
                                  if (kDebugMode) debugPrint('Avatar load error: $error');
                                  return Image.asset(
                                    'assets/images/default.png',
                                    width: 84,
                                    height: 84,
                                    fit: BoxFit.cover,
                                  );
                                },
                              ),
                            ),
                          ),
                          const SizedBox(width: 18),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name.isNotEmpty ? name : "Khách hàng",
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF023E8A),
                                  ),
                                ),
                                if (email.isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Text(
                                      email,
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: Colors.grey.shade700,
                                        fontWeight: FontWeight.w500,
                                      ),
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
                      label: "Thông tin tài khoản",
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
                      icon: Icons.notifications_outlined,
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
                      trailingColor: Colors.redAccent.withOpacity(0.6),
                      onTap: () {
                        _showLogoutDialog(context, homeBloc);
                      },
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 12, bottom: 8, left: 4),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: Color(0xFF023E8A),
            letterSpacing: 0.3,
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color iconColor = const Color(0xFF1976D2),
    Color textColor = const Color(0xFF023E8A),
    Color? trailingColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 3),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withAlpha(30),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ListTile(
        leading: Icon(icon, color: iconColor, size: 26),
        title: Text(
          label,
          style: TextStyle(
            fontSize: 16,
            color: textColor,
            fontWeight: FontWeight.w600,
          ),
        ),
        trailing: Icon(Icons.chevron_right, color: trailingColor ?? const Color(0xFF1976D2).withOpacity(0.7), size: 26),
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, HomeBloc homeBloc) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          elevation: 12,
          backgroundColor: Colors.white,
          child: Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.logout, size: 56, color: Colors.redAccent),
                const SizedBox(height: 20),
                const Text(
                  "Bạn có chắc chắn muốn đăng xuất?",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: Color(0xFF023E8A)),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.grey[300],
                        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text("Hủy", style: TextStyle(fontSize: 15, color: Colors.black87, fontWeight: FontWeight.w600)),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        homeBloc.add(LogoutEvent());
                        Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                        elevation: 4,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text("Xác nhận", style: TextStyle(fontSize: 15, color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}