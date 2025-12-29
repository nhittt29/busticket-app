// lib/review/screens/my_reviews_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../bloc/review/review_bloc.dart';
import '../bloc/review/review_event.dart';
import '../bloc/review/review_state.dart';
import '../review/screens/write_review_screen.dart';
import '../review/models/review.dart';
import '../../theme/app_colors.dart';

class MyReviewsScreen extends StatelessWidget {
  const MyReviewsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ReviewBloc()..add(LoadReviewsEvent()),
      child: DefaultTabController(
        length: 2,
        child: Scaffold(
          backgroundColor: Colors.grey[50],
          appBar: AppBar(
            flexibleSpace: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primaryBlue, AppColors.accentBlue],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
            elevation: 0,
            centerTitle: true,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
              onPressed: () => Navigator.pop(context),
            ),
            title: const Text(
              "Đánh giá của tôi",
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.5,
              ),
            ),
            bottom: const TabBar(
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              indicatorColor: Colors.white,
              indicatorWeight: 3.5,
              labelStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              tabs: [
                Tab(text: "Chưa đánh giá"),
                Tab(text: "Lịch sử"),
              ],
            ),
          ),
          body: BlocBuilder<ReviewBloc, ReviewState>(
            builder: (context, state) {
              if (state is ReviewLoading) {
                return const Center(
                  child: CircularProgressIndicator(color: AppColors.primaryBlue, strokeWidth: 3),
                );
              } else if (state is ReviewError) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.sentiment_dissatisfied_rounded, size: 80, color: Colors.grey[500]),
                        const SizedBox(height: 20),
                        const Text(
                          'Không tải được đánh giá',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          state.message,
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: () => context.read<ReviewBloc>().add(LoadReviewsEvent()),
                          icon: const Icon(Icons.refresh_rounded),
                          label: const Text('Thử lại', style: TextStyle(fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryBlue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 8,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              } else if (state is ReviewLoaded) {
                return TabBarView(
                  children: [
                    _UnreviewedTab(tickets: state.unreviewedTickets),
                    _HistoryTab(reviews: state.reviewHistory),
                  ],
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ),
      ),
    );
  }
}

class _UnreviewedTab extends StatelessWidget {
  final List<dynamic> tickets;
  const _UnreviewedTab({required this.tickets});

  @override
  Widget build(BuildContext context) {
    if (tickets.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.rate_review_outlined, size: 80, color: Colors.grey[300]),
              const SizedBox(height: 16),
              const Text(
                'Không có chuyến đi nào\ncần đánh giá',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black54),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
      itemCount: tickets.length,
      itemBuilder: (context, index) {
        final ticket = tickets[index];
        final schedule = ticket['schedule'] ?? {};
        final route = schedule['route'] ?? {};
        final bus = schedule['bus'] ?? {};
        final brand = bus['brand'] ?? {};

        final startPoint = route['startPoint']?.toString() ?? 'Điểm đi';
        final endPoint = route['endPoint']?.toString() ?? 'Điểm đến';

        final departureTime = DateTime.tryParse(schedule['departureAt'] ?? '');
        final dateStr = departureTime != null
            ? DateFormat('dd/MM/yyyy HH:mm').format(departureTime)
            : 'N/A';

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primaryBlue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.directions_bus_rounded, color: AppColors.primaryBlue, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "$startPoint → $endPoint",
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.deepBlue),
                            maxLines: 1, overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "Nhà xe: ${brand['name'] ?? 'Không rõ'}",
                            style: TextStyle(color: Colors.grey[600], fontSize: 14),
                            maxLines: 1, overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(height: 1, color: Colors.grey[100]),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                     Row(
                      children: [
                        Icon(Icons.calendar_today_rounded, size: 16, color: Colors.grey[500]),
                        const SizedBox(width: 6),
                        Text(
                          dateStr,
                          style: TextStyle(color: Colors.grey[700], fontSize: 14, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                    ElevatedButton.icon(
                      onPressed: () => _navigateToWriteReview(context, ticket['id'], bus['id'], ticket['paymentHistoryId']),
                      icon: const Icon(Icons.star_rounded, size: 18),
                      label: const Text("Đánh giá ngay", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryBlue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        elevation: 4,
                        shadowColor: AppColors.primaryBlue.withOpacity(0.3),
                      ),
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

  void _navigateToWriteReview(BuildContext context, int ticketId, int busId, int? paymentHistoryId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WriteReviewScreen(
          ticketId: ticketId,
          busId: busId,
          paymentHistoryId: paymentHistoryId,
        ),
      ),
    ).then((_) {
      if (context.mounted) {
        context.read<ReviewBloc>().add(LoadReviewsEvent());
      }
    });
  }
}

class _HistoryTab extends StatelessWidget {
  final List<dynamic> reviews;
  const _HistoryTab({required this.reviews});

  @override
  Widget build(BuildContext context) {
    if (reviews.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.history_rounded, size: 80, color: Colors.grey[300]),
              const SizedBox(height: 16),
              const Text(
                'Chưa có lịch sử đánh giá',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black54),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
      itemCount: reviews.length,
      itemBuilder: (context, index) {
        final review = reviews[index];
        final bus = review['bus'] ?? {};
        final brandName = bus['brand'] != null ? bus['brand']['name'] : 'Nhà xe';
        final rating = review['rating'] ?? 0;
        final comment = review['comment'] ?? '';
        final createdAt = DateTime.tryParse(review['createdAt'] ?? '');
        final dateStr = createdAt != null ? DateFormat('dd/MM/yyyy').format(createdAt) : '';

        final ticket = review['ticket'] ?? {};
        final schedule = ticket['schedule'] ?? {};
        final route = schedule['route'] ?? {};
        final routeStr = (route['startPoint'] != null && route['endPoint'] != null)
            ? "${route['startPoint']} → ${route['endPoint']}"
            : "Chuyến đi";

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        brandName,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.deepBlue),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                         dateStr,
                         style: TextStyle(color: Colors.grey[600], fontSize: 12),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                 Text(
                  routeStr,
                  style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
                const SizedBox(height: 12),
                
                // RATING ROW & EDIT BUTTON
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: List.generate(5, (i) => Icon(
                        i < rating ? Icons.star_rounded : Icons.star_border_rounded,
                        color: Colors.amber,
                        size: 20,
                      )),
                    ),
                    TextButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => WriteReviewScreen(
                              ticketId: review['ticketId'],
                              busId: review['busId'],
                              existingReview: Review.fromJson(review),
                            ),
                          ),
                        ).then((_) {
                          if (context.mounted) {
                            context.read<ReviewBloc>().add(LoadReviewsEvent());
                          }
                        });
                      },
                      icon: const Icon(Icons.edit, size: 16),
                      label: const Text("Sửa", style: TextStyle(fontSize: 13)),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.primaryBlue,
                        padding: EdgeInsets.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                  ],
                ),
                
                if (comment.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.backgroundLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      comment,
                      style: const TextStyle(fontSize: 14, fontStyle: FontStyle.italic, color: Colors.black87),
                    ),
                  ),
                ],
                
                if (review['images'] != null && (review['images'] as List).isNotEmpty) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 70,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: (review['images'] as List).length,
                      itemBuilder: (context, imgIndex) {
                        final imgUrl = review['images'][imgIndex];
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: _buildReviewImage(imgUrl),
                          ),
                        );
                      },
                    ),
                  ),
                ],

                if (review['reply'] != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.successGreen.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.successGreen.withOpacity(0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Phản hồi từ Admin:",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: AppColors.successGreen,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          review['reply'],
                          style: const TextStyle(fontSize: 14, color: Colors.black87),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildReviewImage(String imgUrl) {
    if (imgUrl.startsWith('data:image')) {
      try {
        final base64String = imgUrl.split(',').last;
        return Image.memory(
          base64Decode(base64String),
          width: 70,
          height: 70,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => _buildErrorImage(),
        );
      } catch (e) {
        return _buildErrorImage();
      }
    } else {
      return Image.network(
        imgUrl,
        width: 70,
        height: 70,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => _buildErrorImage(),
      );
    }
  }

  Widget _buildErrorImage() {
    return Container(
      width: 70,
      height: 70,
      color: Colors.grey[200],
      child: const Icon(Icons.broken_image, color: Colors.grey),
    );
  }
}