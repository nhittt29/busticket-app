// lib/promotion/screens/promotions_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../cubit/promotion_cubit.dart';
import '../cubit/promotion_state.dart';

const Color primaryBlue = Color(0xFF6AB7F5);
const Color accentBlue = Color(0xFF4A9EFF);
const Color deepBlue = Color(0xFF1976D2);
const Color pastelBlue = Color(0xFFA0D8F1);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color successGreen = Color(0xFF4CAF50);

// MÀU MỚI CHO VOUCHER – SIÊU NỔI, SIÊU ĐẸP
const Color voucherStart = Color(0xFFFF6B6B); // Cam hồng
const Color voucherEnd = Color(0xFFFF8E8E);
const Color voucherButton = Color(0xFFFE5F5F);

class PromotionsScreen extends StatelessWidget {
  const PromotionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => PromotionCubit()..loadPromotions(),
      child: Scaffold(
        backgroundColor: backgroundLight,
        appBar: AppBar(
          flexibleSpace: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [primaryBlue, accentBlue],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),
          elevation: 0,
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Text(
            'Mã khuyến mãi',
            style: TextStyle(
              color: Colors.white,
              fontSize: 23,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
        ),
        body: BlocBuilder<PromotionCubit, PromotionState>(
          builder: (context, state) {
            if (state.loading) {
              return const Center(
                child: CircularProgressIndicator(color: primaryBlue, strokeWidth: 3),
              );
            }

            if (state.error != null) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.sentiment_dissatisfied_rounded, size: 80, color: Colors.grey[500]),
                      const SizedBox(height: 20),
                      Text(
                        'Không tải được mã khuyến mãi',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey[800]),
                      ),
                      const SizedBox(height: 8),
                      Text(state.error!, textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600])),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () => context.read<PromotionCubit>().loadPromotions(),
                        icon: const Icon(Icons.refresh_rounded),
                        label: const Text('Thử lại', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryBlue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 8,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }

            if (state.promotions.isEmpty) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(40),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.card_giftcard_rounded, size: 100, color: Colors.grey[400]),
                      const SizedBox(height: 24),
                      Text(
                        'Chưa có khuyến mãi nào',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey[700]),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Các chương trình ưu đãi sẽ được cập nhật thường xuyên\nHãy quay lại sau nhé!',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 16, color: Colors.grey[600], height: 1.5),
                      ),
                    ],
                  ),
                ),
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
              itemCount: state.promotions.length,
              separatorBuilder: (_, __) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final promo = state.promotions[index];
                final dateFormat = DateFormat('dd/MM/yyyy');
                final isExpired = DateTime.now().isAfter(promo.endDate);

                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: isExpired ? Colors.grey.withAlpha(80) : voucherStart.withAlpha(100),
                      width: 1.6,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: isExpired ? Colors.transparent : voucherStart.withAlpha(70),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    borderRadius: BorderRadius.circular(24),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(24),
                      onTap: isExpired ? null : () => Navigator.pop(context, promo),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Row(
                          children: [
                            // ICON VOUCHER – MÀU CAM HỒNG GRADIENT SIÊU NỔI
                            Container(
                              width: 68,
                              height: 68,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: isExpired
                                      ? [Colors.grey.shade300, Colors.grey.shade400]
                                      : [voucherStart, voucherEnd],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [
                                  BoxShadow(
                                    color: isExpired ? Colors.transparent : voucherStart.withAlpha(120),
                                    blurRadius: 14,
                                    offset: const Offset(0, 6),
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.local_offer_rounded,
                                color: Colors.white,
                                size: 36,
                              ),
                            ),
                            const SizedBox(width: 18),

                            // NỘI DUNG
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    promo.code,
                                    style: TextStyle(
                                      fontSize: 19,
                                      fontWeight: FontWeight.bold,
                                      color: isExpired ? Colors.grey[500] : voucherButton,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    promo.description,
                                    style: TextStyle(
                                      fontSize: 15,
                                      color: isExpired ? Colors.grey[500] : Colors.grey[700],
                                      height: 1.4,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.access_time_rounded,
                                        size: 16,
                                        color: isExpired ? Colors.red.shade400 : voucherButton,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        'HSD: ${dateFormat.format(promo.endDate)}',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: isExpired ? Colors.red.shade400 : voucherButton,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),

                            // NÚT DÙNG NGAY – CÙNG MÀU VỚI VOUCHER
                            if (!isExpired)
                              ElevatedButton(
                                onPressed: () => Navigator.pop(context, promo),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: voucherButton,
                                  foregroundColor: Colors.white,
                                  elevation: 8,
                                  shadowColor: voucherButton.withAlpha(130),
                                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                                ),
                                child: const Text(
                                  'Dùng ngay',
                                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                              )
                            else
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade200,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  'Hết hạn',
                                  style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w600, fontSize: 13),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}