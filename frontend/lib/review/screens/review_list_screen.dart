// lib/review/screens/review_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/review_bloc.dart';
import '../bloc/review_event.dart';
import '../bloc/review_state.dart';
import '../widgets/review_card.dart';
import 'write_review_screen.dart';

const Color primaryBlue = Color(0xFF6AB7F5);
const Color accentBlue = Color(0xFF4A9EFF);
const Color deepBlue = Color(0xFF1976D2);
const Color pastelBlue = Color(0xFFA0D8F1);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color successGreen = Color(0xFF4CAF50);

class ReviewListScreen extends StatefulWidget {
  final int userId;

  const ReviewListScreen({super.key, required this.userId});

  @override
  State<ReviewListScreen> createState() => _ReviewListScreenState();
}

class _ReviewListScreenState extends State<ReviewListScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<ReviewBloc>().add(LoadReviewsEvent(widget.userId));
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundLight,
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [primaryBlue, accentBlue],
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
          'Đánh giá của tôi',
          style: TextStyle(
            color: Colors.white,
            fontSize: 23,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          tabs: const [
            Tab(text: 'Chưa đánh giá'),
            Tab(text: 'Lịch sử đánh giá'),
          ],
        ),
      ),
      body: BlocBuilder<ReviewBloc, ReviewState>(
        builder: (context, state) {
          // Loading toàn bộ lần đầu
          if (state.loading && state.pendingReviews.isEmpty && state.historyReviews.isEmpty) {
            return const Center(
              child: CircularProgressIndicator(color: primaryBlue, strokeWidth: 3),
            );
          }

          return TabBarView(
            controller: _tabController,
            children: [
              // TAB 1: CHƯA ĐÁNH GIÁ
              state.pendingReviews.isEmpty
                  ? _buildEmptyState(
                      icon: Icons.rate_review_outlined,
                      title: 'Chưa có chuyến nào cần đánh giá',
                      subtitle: 'Khi bạn hoàn thành chuyến đi, bạn sẽ được mời đánh giá ở đây',
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
                      itemCount: state.pendingReviews.length,
                      itemBuilder: (context, index) {
                        final ticket = state.pendingReviews[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: pastelBlue.withAlpha(150), width: 1.5),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withAlpha(60),
                                blurRadius: 14,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ReviewCard(
                            ticketData: ticket,
                            isHistory: false,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => WriteReviewScreen(
                                    ticketId: ticket['id'],
                                    userId: widget.userId,
                                    ticketData: ticket,
                                  ),
                                ),
                              ).then((_) {
                                // Không cần reload thủ công vì ReviewBloc đã tự reload khi submit thành công
                              });
                            },
                          ),
                        );
                      },
                    ),

              // TAB 2: LỊCH SỬ ĐÁNH GIÁ
              state.historyReviews.isEmpty
                  ? _buildEmptyState(
                      icon: Icons.history_rounded,
                      title: 'Chưa có đánh giá nào',
                      subtitle: 'Các đánh giá bạn đã gửi sẽ xuất hiện tại đây',
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
                      itemCount: state.historyReviews.length,
                      itemBuilder: (context, index) {
                        final review = state.historyReviews[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: pastelBlue.withAlpha(150), width: 1.5),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withAlpha(60),
                                blurRadius: 14,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ReviewCard(
                            reviewData: review,
                            isHistory: true,
                          ),
                        );
                      },
                    ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 100,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}