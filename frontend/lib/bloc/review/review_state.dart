abstract class ReviewState {}

class ReviewInitial extends ReviewState {}

class ReviewLoading extends ReviewState {}

class ReviewLoaded extends ReviewState {
  final List<dynamic> unreviewedTickets;
  final List<dynamic> reviewHistory;

  ReviewLoaded({this.unreviewedTickets = const [], this.reviewHistory = const []});
}

class ReviewError extends ReviewState {
  final String message;
  ReviewError(this.message);
}
