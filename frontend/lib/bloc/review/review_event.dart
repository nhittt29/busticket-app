abstract class ReviewEvent {}

class LoadReviewsEvent extends ReviewEvent {}

class SubmitReviewEvent extends ReviewEvent {
  final int ticketId;
  final int rating;
  final String comment;

  SubmitReviewEvent({required this.ticketId, required this.rating, required this.comment});
}
