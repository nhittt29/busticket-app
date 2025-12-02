import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/promotions_service.dart';
import 'promotion_state.dart';

class PromotionCubit extends Cubit<PromotionState> {
  PromotionCubit() : super(PromotionState.initial());

  /// Tải danh sách khuyến mãi
  Future<void> loadPromotions() async {
    emit(state.copyWithClearError(loading: true));
    try {
      final promotions = await PromotionsService.fetchActivePromotions();
      emit(state.copyWithClearError(
        loading: false,
        promotions: promotions,
      ));
    } catch (e) {
      emit(state.copyWith(
        loading: false,
        error: e.toString().replaceAll("Exception: ", ""),
      ));
    }
  }

  /// Kiểm tra và áp dụng mã
  Future<void> applyCode(String code, double orderValue) async {
    emit(state.copyWithClearError(loading: true));
    try {
      final result = await PromotionsService.applyPromotion(code, orderValue);
      
      emit(state.copyWithClearError(
        loading: false,
        appliedPromotion: result['promotion'],
        discountAmount: result['discountAmount'],
      ));
    } catch (e) {
      emit(state.copyWith(
        loading: false,
        error: e.toString().replaceAll("Exception: ", ""),
        appliedPromotion: null,
        discountAmount: 0.0,
      ));
    }
  }

  /// Reset trạng thái áp dụng (khi người dùng muốn gỡ mã hoặc nhập lại)
  void resetApplied() {
    emit(state.copyWithClearError(
      appliedPromotion: null,
      discountAmount: 0.0,
    ));
  }
}
