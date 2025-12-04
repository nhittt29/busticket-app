import 'package:equatable/equatable.dart';
import '../models/review_model.dart';

class ReviewState extends Equatable {
  final bool loading;
  final List<dynamic> pendingReviews;
  final List<Review> historyReviews;
  final String? error;
  final bool submitSuccess;

  const ReviewState({
    this.loading = false,
    this.pendingReviews = const [],
    this.historyReviews = const [],
    this.error,
    this.submitSuccess = false,
  });

  ReviewState copyWith({
    bool? loading,
    List<dynamic>? pendingReviews,
    List<Review>? historyReviews,
    String? error,
    bool? submitSuccess,
  }) {
    return ReviewState(
      loading: loading ?? this.loading,
      pendingReviews: pendingReviews ?? this.pendingReviews,
      historyReviews: historyReviews ?? this.historyReviews,
      error: error, // Clear error on new state if not provided
      submitSuccess: submitSuccess ?? this.submitSuccess,
    );
  }

  @override
  List<Object?> get props => [loading, pendingReviews, historyReviews, error, submitSuccess];
}
