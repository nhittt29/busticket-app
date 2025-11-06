// lib/payment/widgets/payment_method_tile.dart
import 'package:flutter/material.dart';

class PaymentMethodTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const PaymentMethodTile({
    super.key,
    required this.icon,
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF66BB6A).withOpacity(0.1) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? const Color(0xFF66BB6A) : Colors.grey.shade300),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? const Color(0xFF66BB6A) : Colors.grey.shade600),
            const SizedBox(width: 16),
            Text(title, style: TextStyle(fontSize: 16, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
            const Spacer(),
            if (isSelected) const Icon(Icons.check_circle, color: Color(0xFF66BB6A)),
          ],
        ),
      ),
    );
  }
}