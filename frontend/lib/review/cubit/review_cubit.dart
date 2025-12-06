import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/review_api_service.dart';
import 'review_state.dart';

class ReviewCubit extends Cubit<ReviewState> {
  ReviewCubit() : super(ReviewInitial());

  Future<void> loadReviews(int busId) async {
    emit(ReviewLoading());
    try {
      final reviews = await ReviewApiService.getReviewsByBus(busId);
      final stats = await ReviewApiService.getStats(busId);
      emit(ReviewLoaded(
        reviews: reviews,
        averageRating: (stats['average'] as num).toDouble(),
        totalReviews: stats['count'] as int,
      ));
    } catch (e) {
      emit(ReviewError(e.toString()));
    }
  }

  Future<void> createReview(int ticketId, int rating, String comment, List<String> images) async {
    emit(ReviewLoading());
    try {
      await ReviewApiService.createReview(ticketId, rating, comment, images);
      emit(const ReviewOperationSuccess('Đánh giá thành công!'));
    } catch (e) {
      emit(ReviewError(e.toString()));
    }
  }

  Future<void> updateReview(int id, int rating, String comment, List<String> images) async {
    emit(ReviewLoading());
    try {
      await ReviewApiService.updateReview(id, rating, comment, images);
      emit(const ReviewOperationSuccess('Cập nhật đánh giá thành công!'));
    } catch (e) {
      emit(ReviewError(e.toString()));
    }
  }

  Future<void> deleteReview(int id) async {
    emit(ReviewLoading());
    try {
      await ReviewApiService.deleteReview(id);
      emit(const ReviewOperationSuccess('Xóa đánh giá thành công!'));
    } catch (e) {
      emit(ReviewError(e.toString()));
    }
  }
}
