import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ReviewCard extends StatelessWidget {
  final Map<String, dynamic>? ticketData; // For pending reviews
  final dynamic reviewData; // For history reviews
  final bool isHistory;
  final VoidCallback? onTap;

  const ReviewCard({
    super.key,
    this.ticketData,
    this.reviewData,
    this.isHistory = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Extract data based on type
    final data = (isHistory ? reviewData.ticket : ticketData) ?? {};
    final schedule = data['schedule'] ?? {};
    final route = schedule['route'] ?? {};
    final bus = schedule['bus'] ?? {};
    final departureTimeStr = schedule['departureAt'] ?? schedule['departureTime']; // Handle both keys
    final departureTime = departureTimeStr != null ? DateTime.tryParse(departureTimeStr) : null;
    
    // Format date
    final dateStr = departureTime != null ? DateFormat('dd/MM/yyyy HH:mm').format(departureTime) : '—';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.directions_bus, color: Colors.blue),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        bus['brand']?['name'] ?? 'Nhà xe',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        '${route['startPoint'] ?? '?'} - ${route['endPoint'] ?? '?'}',
                        style: TextStyle(color: Colors.grey[600], fontSize: 13),
                      ),
                    ],
                  ),
                ),
                if (isHistory)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star, size: 14, color: Colors.orange),
                        const SizedBox(width: 4),
                        Text(
                          '${reviewData.rating}',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Khởi hành: $dateStr',
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
                Text(
                  'Biển số: ${bus['licensePlate'] ?? '—'}',
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
              ],
            ),
            if (isHistory && reviewData.comment != null && reviewData.comment!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  reviewData.comment!,
                  style: const TextStyle(fontSize: 14, fontStyle: FontStyle.italic),
                ),
              ),
            ],
            if (!isHistory) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onTap,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Đánh giá ngay'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
