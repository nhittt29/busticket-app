import 'package:equatable/equatable.dart';
import '../models/promotion.dart';

class PromotionState extends Equatable {
  final bool loading;
  final List<Promotion> promotions;
  final String? error;
  
  // Kết quả sau khi áp dụng mã thành công (dùng để trả về cho BookingCubit)
  final Promotion? appliedPromotion;
  final double discountAmount;

  const PromotionState({
    required this.loading,
    required this.promotions,
    this.error,
    this.appliedPromotion,
    this.discountAmount = 0.0,
  });

  factory PromotionState.initial() => const PromotionState(
        loading: false,
        promotions: [],
        error: null,
        appliedPromotion: null,
        discountAmount: 0.0,
      );

  PromotionState copyWith({
    bool? loading,
    List<Promotion>? promotions,
    String? error,
    Promotion? appliedPromotion,
    double? discountAmount,
  }) {
    return PromotionState(
      loading: loading ?? this.loading,
      promotions: promotions ?? this.promotions,
      error: error, // Nếu không truyền thì giữ nguyên null hoặc giá trị cũ? Thường error nên reset khi thành công.
                    // Ở đây ta sẽ logic: nếu truyền error thì lấy, nếu không thì null (để clear lỗi cũ)
                    // Tuy nhiên copyWith chuẩn thường giữ giá trị cũ nếu null.
                    // Để đơn giản: error sẽ được truyền null khi success.
      appliedPromotion: appliedPromotion ?? this.appliedPromotion,
      discountAmount: discountAmount ?? this.discountAmount,
    );
  }
  
  // Helper để clear error khi copyWith
  PromotionState copyWithClearError({
    bool? loading,
    List<Promotion>? promotions,
    Promotion? appliedPromotion,
    double? discountAmount,
  }) {
    return PromotionState(
      loading: loading ?? this.loading,
      promotions: promotions ?? this.promotions,
      error: null,
      appliedPromotion: appliedPromotion ?? this.appliedPromotion,
      discountAmount: discountAmount ?? this.discountAmount,
    );
  }

  @override
  List<Object?> get props => [loading, promotions, error, appliedPromotion, discountAmount];
}
