// lib/ticket/widgets/ticket_card.dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../review/screens/write_review_screen.dart';

class TicketCard extends StatelessWidget {
  final Map<String, dynamic> ticket;
  final List<Map<String, dynamic>>? groupTickets;
  final VoidCallback onTap;
  final bool isHighlighted;

  const TicketCard({
    super.key,
    required this.ticket,
    this.groupTickets,
    required this.onTap,
    this.isHighlighted = false,
  });

  String _status(String? s) => s == 'PAID' || s == 'Đã thanh toán'
      ? 'Đã thanh toán'
      : s == 'BOOKED'
          ? 'Đang giữ chỗ'
          : 'Đã hủy';

  Color _statusColor(String? s) => s == 'PAID' || s == 'Đã thanh toán'
      ? const Color(0xFF00C853) // Green A700
      : s == 'BOOKED'
          ? const Color(0xFFFFAB00) // Amber A700
          : const Color(0xFFD50000); // Red A700

  @override
  Widget build(BuildContext context) {
    final schedule = ticket['schedule'] ?? {};
    // Fallback keys for departure time and bus name
    final depTime = schedule['departureAt'] ?? schedule['departureTime']; 
    final startTime = _formatTime(depTime);
    final startDate = _formatDateSimple(depTime);
    
    // Restore route definitions
    final route = ticket['schedule']?['route'] ?? {};
    final start = route['startPoint'] ?? '—';
    final end = route['endPoint'] ?? '—';

    // Bus name might be in bus['name'] or bus['busName']
    final bus = schedule['bus'] ?? {};
    final busName = bus['name'] ?? bus['busName'] ?? 'Xe khách';
    
    final isGroup = groupTickets != null && groupTickets!.length > 1;

    // Ghế
    late final String seatDisplay;
    if (isGroup) {
      final seats = groupTickets!
          .map((t) => t['seat']?['code']?.toString() ?? '')
          .where((s) => s.isNotEmpty)
          .toList();
      seatDisplay = seats.isEmpty
          ? '—'
          : seats.length <= 3
              ? seats.join(', ')
              : '${seats.take(3).join(', ')}...';
    } else {
      seatDisplay = ticket['seat']?['code']?.toString() ?? '—';
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 200, // Fixed height for consistent look (increased to fix overflow)
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: CustomPaint(
          painter: TicketPainter(
            borderColor: isHighlighted ? const Color(0xFF00C853) : Colors.transparent,
            bgColor: const Color(0xFFFFFFFE), // Bright white for clean look, or slightly off-white
          ),
          child: Row(
            children: [
              // --- LEFT SECTION (Main Info) ---
              Expanded(
                flex: 70,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Header: Bus Name & ID
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Text(
                              busName.toUpperCase(),
                              style: TextStyle(
                                  color: Colors.blueGrey[400],
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.blueGrey[50],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '#${ticket['id']}',
                              style: const TextStyle(
                                  fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          )
                        ],
                      ),
                      // Route
                      Row(
                        children: [
                          _buildDot(color: const Color(0xFF2196F3)), // Blue 500
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              start,
                              style: const TextStyle(
                                  fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF263238)),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 3),
                        child: Container(
                          height: 14,
                          width: 1,
                          color: Colors.blueGrey[100],
                        ),
                      ),
                      Row(
                        children: [
                          _buildDot(color: const Color(0xFFF44336)), // Red 500
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              end,
                              style: const TextStyle(
                                  fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF263238)),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const Divider(),
                      // Time & Date
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('KHỞI HÀNH',
                                  style: TextStyle(
                                      fontSize: 10, color: Colors.blueGrey[400])),
                              const SizedBox(height: 2),
                              Text(startTime,
                                  style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF263238))),
                              Text(startDate,
                                  style: const TextStyle(
                                      fontSize: 12, color: Colors.blueGrey)),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('GHẾ',
                                  style: TextStyle(
                                      fontSize: 10, color: Colors.blueGrey[400])),
                              const SizedBox(height: 2),
                              Text(seatDisplay,
                                  style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF263238))),
                            ],
                          ),
                        ],
                      )
                    ],
                  ),
                ),
              ),
              // --- DIVIDER LINE (Visual only, handled by Painter) ---
              // --- RIGHT SECTION (Status & Action) ---
              Expanded(
                flex: 30,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Status Icon/Badge
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _statusColor(ticket['status']).withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          _getStatusIcon(ticket['status']),
                          color: _statusColor(ticket['status']),
                          size: 24,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _status(ticket['status']),
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: _statusColor(ticket['status']),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      if (ticket['status'] == 'BOOKED' ||
                          ticket['status'] == 'Đang chờ')
                        OutlinedButton(
                          onPressed: () => _handlePayment(context, ticket),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFFA50064)),
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            minimumSize: const Size(0, 30),
                          ),
                          child: const Text('Thanh toán',
                              style: TextStyle(fontSize: 10, color: Color(0xFFA50064))),
                        ),
                      if (ticket['status'] == 'PAID' ||
                          ticket['status'] == 'Đã thanh toán')
                        const Text(
                          'Xem vé',
                          style: TextStyle(
                              fontSize: 11,
                              decoration: TextDecoration.underline,
                              color: Colors.blue),
                        ),
                       const Spacer(),
                      // Booking Date (Tiny)
                      Text(
                         _formatDate(ticket['createdAt']),
                         style: TextStyle(fontSize: 9, color: Colors.blueGrey[300]),
                         textAlign: TextAlign.center,
                      )
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDot({required Color color}) {
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: color, width: 2),
        shape: BoxShape.circle,
      ),
    );
  }

  void _handlePayment(BuildContext context, Map<String, dynamic> ticket) async {
    final url = ticket['paymentHistory']?['payUrl'] as String?;
    if (url != null) {
      final uri = Uri.parse(url);
      try {
        if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
          await launchUrl(uri, mode: LaunchMode.platformDefault);
        }
      } catch (e) {
        debugPrint('Could not launch: $e');
      }
    }
  }

  IconData _getStatusIcon(String? s) {
    if (s == 'PAID' || s == 'Đã thanh toán') return Icons.check_circle;
    if (s == 'BOOKED') return Icons.access_time_filled;
    return Icons.cancel;
  }

  String _formatTime(String? dateStr) {
    if (dateStr == null) return '--:--';
    try {
      final date = DateTime.parse(dateStr).toLocal();
      return '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '--:--';
    }
  }

  String _formatDateSimple(String? dateStr) {
    if (dateStr == null) return '--/--';
    try {
      final date = DateTime.parse(dateStr).toLocal();
      return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}';
    } catch (_) {
      return '--/--';
    }
  }
  
  String _formatDate(String? dateStr) {
     if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr).toLocal();
      final day = date.day.toString().padLeft(2, '0');
      final month = date.month.toString().padLeft(2, '0');
      final year = (date.year % 100).toString();
      final hour = date.hour.toString().padLeft(2, '0');
      final minute = date.minute.toString().padLeft(2, '0');
      return 'Đặt lúc $day/$month/$year $hour:$minute';
    } catch (_) {
      return '';
    }
  }
}

class TicketPainter extends CustomPainter {
  final Color borderColor;
  final Color bgColor;

  TicketPainter({required this.borderColor, required this.bgColor});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = bgColor
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    const cutRadius = 10.0;
    final splitX = size.width * 0.70; // 70% width partition

    final path = Path();
    path.moveTo(0, 0); // Top Left
    
    // Top Edge with Cutout
    path.lineTo(splitX - cutRadius, 0);
    path.arcToPoint(Offset(splitX + cutRadius, 0),
        radius: const Radius.circular(cutRadius), clockwise: false);
    path.lineTo(size.width, 0);

    // Right Edge
    path.lineTo(size.width, size.height);

    // Bottom Edge with Cutout
    path.lineTo(splitX + cutRadius, size.height);
    path.arcToPoint(Offset(splitX - cutRadius, size.height),
        radius: const Radius.circular(cutRadius), clockwise: false);
    path.lineTo(0, size.height);

    // Left Edge
    path.lineTo(0, 0);
    path.close();

    // Shadow
    canvas.drawShadow(path, const Color(0xFF204060).withValues(alpha: 0.08), 5, false);
    canvas.drawPath(path, paint);

    if (borderColor != Colors.transparent) {
      canvas.drawPath(path, borderPaint);
    }

    // Dashed Line
    final dashPaint = Paint()
      ..color = Colors.grey[300]!
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    
    const dashHeight = 5.0;
    const dashSpace = 5.0;
    double startY = cutRadius + 5;
    while (startY < size.height - cutRadius - 5) {
      canvas.drawLine(
        Offset(splitX, startY),
        Offset(splitX, startY + dashHeight),
        dashPaint,
      );
      startY += dashHeight + dashSpace;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}