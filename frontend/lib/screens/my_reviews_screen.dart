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

const Color primaryBlue = Color(0xFF6AB7F5);
const Color accentBlue = Color(0xFF4A9EFF);
const Color deepBlue = Color(0xFF1976D2);
const Color pastelBlue = Color(0xFFA0D8F1);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color successGreen = Color(0xFF4CAF50);

// MÀU MỚI CHO MÀN HÌNH ĐÁNH GIÁ – VÀNG CAM ẤM ÁP
const Color reviewGradientStart = Color(0xFFFF9A3C);
const Color reviewGradientEnd = Color(0xFFFF6B35);

class MyReviewsScreen extends StatelessWidget {
  const MyReviewsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ReviewBloc()..add(LoadReviewsEvent()),
      child: DefaultTabController(
        length: 2,
        child: Scaffold(
          backgroundColor: backgroundLight,
          appBar: AppBar(
            flexibleSpace: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [reviewGradientStart, reviewGradientEnd],
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
              "Đánh giá của tôi",
              style: TextStyle(
                color: Colors.white,
                fontSize: 23,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.6,
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
                  child: CircularProgressIndicator(color: reviewGradientStart, strokeWidth: 3),
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
                            backgroundColor: reviewGradientStart,
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
              Icon(Icons.rate_review_outlined, size: 100, color: Colors.grey[400]),
              const SizedBox(height: 24),
              const Text(
                'Không có chuyến đi nào cần đánh giá',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black87),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Khi bạn hoàn thành chuyến đi, bạn sẽ được mời đánh giá tại đây',
                style: TextStyle(fontSize: 16, color: Colors.grey[600], height: 1.5),
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
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: pastelBlue.withAlpha(150), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withAlpha(60),
                blurRadius: 16,
                offset: const Offset(0, 8),
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
                        gradient: const LinearGradient(colors: [reviewGradientStart, reviewGradientEnd]),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.directions_bus_rounded, color: Colors.white, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerLeft,
                            child: Text(
                              "$startPoint → $endPoint",
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: deepBlue),
                            ),
                          ),
                          const SizedBox(height: 4),
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerLeft,
                            child: Text(
                              "Nhà xe: ${brand['name'] ?? 'Không rõ'}",
                              style: TextStyle(color: Colors.grey[700], fontSize: 15),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(Icons.access_time_rounded, size: 18, color: Colors.grey[600]),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        "Khởi hành: $dateStr",
                        style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w600, fontSize: 15),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Align(
                  alignment: Alignment.centerRight,
                  child: ElevatedButton.icon(
                    onPressed: () => _navigateToWriteReview(context, ticket['id'], bus['id'], ticket['paymentHistoryId']),
                    icon: const Icon(Icons.star_rounded, size: 20),

                    label: const Text("Đánh giá ngay", style: TextStyle(fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: reviewGradientStart,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                      elevation: 8,
                      shadowColor: reviewGradientStart.withAlpha(100),
                    ),
                  ),
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
              Icon(Icons.history_rounded, size: 100, color: Colors.grey[400]),
              const SizedBox(height: 24),
              const Text(
                'Chưa có đánh giá nào',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black87),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Các đánh giá bạn đã gửi sẽ xuất hiện tại đây',
                style: TextStyle(fontSize: 16, color: Colors.grey[600], height: 1.5),
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
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: pastelBlue.withAlpha(120), width: 1.4),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withAlpha(60),
                blurRadius: 14,
                offset: const Offset(0, 6),
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
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: deepBlue),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                    // NÚT SỬA ĐÁNH GIÁ
                    IconButton(
                      icon: const Icon(Icons.edit, size: 20, color: Colors.blueGrey),
                      tooltip: 'Sửa đánh giá',
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
                    ),
                    Text(
                      dateStr,
                      style: TextStyle(color: Colors.grey[600], fontSize: 13),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  routeStr,
                  style: TextStyle(fontSize: 16, color: Colors.grey[800], fontWeight: FontWeight.w600),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
                const SizedBox(height: 12),
                Row(
                  children: List.generate(5, (i) => Padding(
                    padding: const EdgeInsets.only(right: 4),
                    child: Icon(
                      i < rating ? Icons.star_rounded : Icons.star_border_rounded,
                      color: Colors.amber,
                      size: 22,
                    ),
                  )),
                ),
                if (comment.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: pastelBlue.withAlpha(30),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      comment,
                      style: const TextStyle(fontSize: 15, fontStyle: FontStyle.italic, color: Colors.black87),
                    ),
                  ),
                ],
                if (review['images'] != null && (review['images'] as List).isNotEmpty) ...[
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 80,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: (review['images'] as List).length,
                      itemBuilder: (context, imgIndex) {
                        final imgUrl = review['images'][imgIndex];
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
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
                      color: Colors.green.withAlpha(20),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.green.withAlpha(50)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Phản hồi từ Admin:",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: Colors.green,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          review['reply'],
                          style: const TextStyle(fontSize: 15, color: Colors.black87),
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
          width: 80,
          height: 80,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => _buildErrorImage(),
        );
      } catch (e) {
        return _buildErrorImage();
      }
    } else {
      return Image.network(
        imgUrl,
        width: 80,
        height: 80,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => _buildErrorImage(),
      );
    }
  }

  Widget _buildErrorImage() {
    return Container(
      width: 80,
      height: 80,
      color: Colors.grey[200],
      child: const Icon(Icons.broken_image, color: Colors.grey),
    );
  }
}