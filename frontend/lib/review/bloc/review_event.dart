import 'package:equatable/equatable.dart';

abstract class ReviewEvent extends Equatable {
  const ReviewEvent();

  @override
  List<Object?> get props => [];
}

class LoadReviewsEvent extends ReviewEvent {
  final int userId;
  const LoadReviewsEvent(this.userId);

  @override
  List<Object?> get props => [userId];
}

class SubmitReviewEvent extends ReviewEvent {
  final int userId;
  final int ticketId;
  final int rating;
  final String? comment;

  const SubmitReviewEvent({
    required this.userId,
    required this.ticketId,
    required this.rating,
    this.comment,
  });

  @override
  List<Object?> get props => [userId, ticketId, rating, comment];
}
