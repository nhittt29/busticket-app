import 'package:flutter_bloc/flutter_bloc.dart';
import 'review_event.dart';
import 'review_state.dart';
import '../services/review_api_service.dart';
import '../../ticket/services/ticket_api_service.dart';
import '../models/review_model.dart';

class ReviewBloc extends Bloc<ReviewEvent, ReviewState> {
  ReviewBloc() : super(const ReviewState()) {
    on<LoadReviewsEvent>(_onLoadReviews);
    on<SubmitReviewEvent>(_onSubmitReview);
  }

  Future<void> _onLoadReviews(LoadReviewsEvent event, Emitter<ReviewState> emit) async {
    emit(state.copyWith(loading: true, error: null, submitSuccess: false));
    try {
      // Fetch ALL user tickets (same as My Tickets screen)
      final tickets = await TicketApiService.getUserTickets(event.userId);

      // Filter Pending Reviews: PAID + COMPLETED + No Review
      final pending = tickets.where((t) {
        final status = t['status'];
        final scheduleStatus = t['schedule']?['status'];
        final hasReview = t['review'] != null;
        return (status == 'PAID' || status == 'Đã thanh toán') &&
               (scheduleStatus == 'COMPLETED') &&
               !hasReview;
      }).toList();

      // Filter History Reviews: Has Review
      final history = tickets.where((t) => t['review'] != null).map((t) {
        final reviewData = Map<String, dynamic>.from(t['review']);
        reviewData['ticket'] = t; // Inject ticket data into review
        return Review.fromJson(reviewData);
      }).toList();

      emit(state.copyWith(
        loading: false,
        pendingReviews: pending,
        historyReviews: history,
      ));
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));
    }
  }

  Future<void> _onSubmitReview(SubmitReviewEvent event, Emitter<ReviewState> emit) async {
    emit(state.copyWith(loading: true, error: null, submitSuccess: false));
    try {
      await ReviewApiService.createReview(
        userId: event.userId,
        ticketId: event.ticketId,
        rating: event.rating,
        comment: event.comment,
      );
      
      // Reload lists after successful submission
      add(LoadReviewsEvent(event.userId));
      emit(state.copyWith(loading: false, submitSuccess: true));
    } catch (e) {
      emit(state.copyWith(loading: false, error: e.toString()));
    }
  }
}
