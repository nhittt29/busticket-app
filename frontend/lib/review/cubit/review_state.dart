import 'package:equatable/equatable.dart';
import '../models/review.dart';

abstract class ReviewState extends Equatable {
  const ReviewState();

  @override
  List<Object?> get props => [];
}

class ReviewInitial extends ReviewState {}

class ReviewLoading extends ReviewState {}

class ReviewLoaded extends ReviewState {
  final List<Review> reviews;
  final double averageRating;
  final int totalReviews;

  const ReviewLoaded({
    required this.reviews,
    required this.averageRating,
    required this.totalReviews,
  });

  @override
  List<Object?> get props => [reviews, averageRating, totalReviews];
}

class ReviewError extends ReviewState {
  final String message;

  const ReviewError(this.message);

  @override
  List<Object?> get props => [message];
}

class ReviewOperationSuccess extends ReviewState {
  final String message;

  const ReviewOperationSuccess(this.message);

  @override
  List<Object?> get props => [message];
}
