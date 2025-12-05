import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/review_service.dart';
import 'review_event.dart';
import 'review_state.dart';

class ReviewBloc extends Bloc<ReviewEvent, ReviewState> {
  final ReviewService _service = ReviewService();

  ReviewBloc() : super(ReviewInitial()) {
    on<LoadReviewsEvent>(_onLoadReviews);
    on<SubmitReviewEvent>(_onSubmitReview);
  }

  Future<void> _onLoadReviews(LoadReviewsEvent event, Emitter<ReviewState> emit) async {
    emit(ReviewLoading());
    try {
      final unreviewed = await _service.getUnreviewedTickets();
      final history = await _service.getMyReviews();
      emit(ReviewLoaded(unreviewedTickets: unreviewed, reviewHistory: history));
    } catch (e) {
      emit(ReviewError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onSubmitReview(SubmitReviewEvent event, Emitter<ReviewState> emit) async {
    // Keep current state to show loading overlay if needed, or emit loading
    // For simplicity, we emit loading then reload
    emit(ReviewLoading());
    try {
      await _service.submitReview(
        ticketId: event.ticketId,
        rating: event.rating,
        comment: event.comment,
      );
      // Reload lists
      add(LoadReviewsEvent());
    } catch (e) {
      emit(ReviewError(e.toString().replaceAll('Exception: ', '')));
      // Retry loading to restore view
      add(LoadReviewsEvent()); 
    }
  }
}
