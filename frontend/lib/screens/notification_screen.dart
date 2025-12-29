// lib/screens/notification_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';                    // THÊM DÒNG NÀY
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../bloc/notification/notification_bloc.dart';               // THÊM DÒNG NÀY
import '../bloc/notification/notification_event.dart';              // THÊM DÒNG NÀY
import '../repositories/notification_repository.dart';

const Color primaryGradientStart = Color(0xFF6AB7F5);
const Color primaryGradientEnd = Color(0xFF4A9EFF);
const Color backgroundLight = Color(0xFFEAF6FF);
const Color cardColor = Colors.white;
const Color deepBlue = Color(0xFF023E8A);

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  List<PendingNotificationRequest> pendingNotifications = [];
  final Map<int, bool> _readStatus = {};
  int? _currentUserId;
  String _selectedFilter = 'Tất cả'; // Filter state
  bool _isNewestFirst = true; // Sort state

  @override
  void initState() {
    super.initState();
    _loadCurrentUserIdAndNotifications();

    // QUAN TRỌNG NHẤT: KHI MỞ TRANG → TỰ ĐỘNG ĐÁNH DẤU ĐÃ ĐỌC → BADGE Ở HOME VỀ 0 NGAY LẬP TỨC
    context.read<NotificationBloc>().add(MarkAllAsReadEvent());
  }
  
  Future<void> _loadCurrentUserIdAndNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    _currentUserId = prefs.getInt('reminder_current_user_id');

    await _loadPendingNotifications();
  }

  Future<void> _loadPendingNotifications() async {
    tz.initializeTimeZones();
    tz.setLocalLocation(tz.getLocation('Asia/Ho_Chi_Minh'));

    final plugin = FlutterLocalNotificationsPlugin();
    // 1. Lấy danh sách đang chờ (Pending) - CHỨA CẢ Future VÀ Delivered (tùy OS/Plugin)
    final pendingList = await plugin.pendingNotificationRequests();
    
    // 2. Lấy danh sách đã hiển thị trên thanh trạng thái (Active/Delivered) - Chỉ Android
    List<ActiveNotification>? activeList;
    final androidPlugin = plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    if (androidPlugin != null) {
      try {
        activeList = await androidPlugin.getActiveNotifications();
      } catch (_) {}
    }

    // 3. FETCH SERVER NOTIFICATIONS
    List<Map<String, dynamic>> serverNotis = [];
    if (_currentUserId != null) {
      try {
        // Simple manual repo instantiation or get from provider if available
        // For now, simple instantiation to avoid major DI refactor
        final repo = NotificationRepository();
        serverNotis = await repo.fetchNotifications(_currentUserId!);
      } catch (_) {}
    }

    // Load read status from Prefs
    final prefs = await SharedPreferences.getInstance();
    final readIds = prefs.getStringList('read_notifications') ?? [];

    // GỘP DANH SÁCH:
    // Cần convert ActiveNotification sang PendingNotificationRequest hoặc tạo model chung.
    // Ở đây ta dùng PendingNotificationRequest làm model hiển thị tạm (vì UI đang dùng nó).
    
    final Map<int, PendingNotificationRequest> combinedMap = {};

    // A. Add Pending (Filter Future out)
    for (var noti in pendingList) {
       // Filter Logic (User/Future)
       if (_isValidNotification(noti)) {
          combinedMap[noti.id] = noti;
       }
    }

    // B. Add Active (Always show because they are DELIVERED)
    if (activeList != null) {
      for (var active in activeList) {
         // ActiveNotification có id, title, body, payload.
         final converted = PendingNotificationRequest(
            active.id ?? 0,
            active.title,
            active.body,
            active.payload,
         );
         
         // Active luôn hợp lệ về thời gian (vì đã hiện rồi), chỉ cần check User
         if (_isUserMatch(converted.id)) {
            combinedMap[active.id ?? 0] = converted;
         }
      }
    }

    // C. Add Server Notifications
    // Map Server ID (1, 2, 3...) -> UI ID (3,000,000 + ID) to avoid conflict
    // and store "isRead" state initial from server
    // Payload from server: needs to map to existing formats if possible or be generic
    for (var sNoti in serverNotis) {
       final sId = sNoti['id'] as int;
       final uiId = 3000000 + sId; // 3M offset for server
       
       final isReadServer = sNoti['isRead'] as bool;
       final isLocallyRead = readIds.contains(uiId.toString());
       _readStatus[uiId] = isReadServer || isLocallyRead;
       
       // Handle payload mapping from SERVER TYPE to UI PAYLOAD PREFIX
       String type = sNoti['type'] ?? 'SYSTEM'; 
       String payloadPrefix = 'system_msg';
       
       switch (type) {
         case 'PAYMENT': payloadPrefix = 'payment_success'; break; 
         case 'TICKET': payloadPrefix = 'boarding_success'; break;
         case 'TICKET_CANCELLED': payloadPrefix = 'ticket_cancelled'; break;
         case 'PAYMENT_REMINDER': payloadPrefix = 'payment_reminder'; break;
         case 'BOARDING_SUCCESS': payloadPrefix = 'boarding_success'; break;
         default: payloadPrefix = 'system_msg';
       }
       
       String payload = payloadPrefix;
       
       // Handle time
       String? createdAt = sNoti['createdAt'];
       int millis = 0;
       if (createdAt != null) {
          millis = DateTime.parse(createdAt).millisecondsSinceEpoch;
          payload += '|$millis';
       }

       final converted = PendingNotificationRequest(
          uiId,
          sNoti['title'],
          sNoti['message'],
          payload,
       );
       combinedMap[uiId] = converted;
    }

    final filtered = combinedMap.values.toList();

    // Sort
    filtered.sort((a, b) => b.id.compareTo(a.id));

    if (!mounted) return;

    setState(() {
      pendingNotifications = filtered;
      for (var noti in filtered) {
        // Check if ID is in saved read list
        // Note: For Server items, we already set _readStatus above.
        // But local items need prefs check.
        if (noti.id < 3000000) {
           final isRead = readIds.contains(noti.id.toString());
           _readStatus[noti.id] = isRead;
        }
      }
    });
  }

  bool _isUserMatch(int id) {
      if (_currentUserId == null) return false;
      int userPart;
      if (id >= 2000000) {
        userPart = (id - 2000000) ~/ 100000;
      } else if (id >= 900000) {
        userPart = (id - 900000) ~/ 100000;
      } else {
        userPart = id ~/ 100000;
      }
      return userPart == _currentUserId;
  }

  bool _isValidNotification(PendingNotificationRequest noti) {
      if (!_isUserMatch(noti.id)) return false;

      // Check Future
      try {
           final payload = noti.payload ?? '';
           final parts = payload.split('|');
           if (parts.length > 1) {
              final millis = int.tryParse(parts[1]);
              if (millis != null) {
                 final notifyTime = DateTime.fromMillisecondsSinceEpoch(millis);
                 // Nếu thời gian > hiện tại => Ẩn (Chờ đến giờ mới hiện)
                 if (notifyTime.isAfter(DateTime.now())) {
                    return false; 
                 }
              }
           }
      } catch (_) {}
      
      return true;
  }

  void _markAllAsRead() async {
    if (_readStatus.values.any((read) => !read)) {
      final prefs = await SharedPreferences.getInstance();
      final readIds = prefs.getStringList('read_notifications') ?? [];
      
      // Add all current IDs to the list
      for (var noti in pendingNotifications) {
        if (!readIds.contains(noti.id.toString())) {
          readIds.add(noti.id.toString());
        }
      }
      await prefs.setStringList('read_notifications', readIds);

      setState(() {
        _readStatus.updateAll((key, value) => true);
      });
      
      // Update badge
      if (mounted) {
        context.read<NotificationBloc>().add(LoadNotificationsEvent());
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: const Text('Đã đánh dấu tất cả là đã đọc', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
            backgroundColor: primaryGradientEnd,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            margin: const EdgeInsets.all(20),
            duration: const Duration(seconds: 2),
          ),
        );
    }
  }

  Future<void> _cancelAll() async {
    final plugin = FlutterLocalNotificationsPlugin();
    for (var noti in pendingNotifications) {
      await plugin.cancel(noti.id);
    }
    setState(() {
      pendingNotifications.clear();
      _readStatus.clear();
    });
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: const Text('Đã xóa tất cả thông báo', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.white)),
          backgroundColor: primaryGradientEnd,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: const EdgeInsets.all(20),
          duration: const Duration(seconds: 3),
        ),
      );
  }

  List<PendingNotificationRequest> get _filteredNotifications {
    List<PendingNotificationRequest> list;

    if (_selectedFilter == 'Tất cả') {
      list = List.from(pendingNotifications);
    } else {
      list = pendingNotifications.where((noti) {
        if (_selectedFilter == 'Chưa đọc') {
          return !(_readStatus[noti.id] ?? false);
        }
        
        final payload = noti.payload ?? '';
        final isTicketRelated = payload.startsWith('booking_success') || 
                                payload.startsWith('payment_reminder') || 
                                payload.startsWith('ticket_expired') ||
                                payload.startsWith('review_reminder') || 
                                payload.startsWith('open_my_reviews');

        if (_selectedFilter == 'Vé & Thanh toán') {
          return isTicketRelated;
        }
        
        if (_selectedFilter == 'Nhắc nhở khởi hành') {
          return !isTicketRelated && payload.startsWith('departure_reminder');
        }
          
        return true;
      }).toList();
    }
    
    // Sort by Time
    list.sort((a, b) {
       DateTime getTime(PendingNotificationRequest req) {
          try {
             final parts = (req.payload ?? '').split('|');
             if (parts.length > 1) {
                final millis = int.tryParse(parts[1]);
                if (millis != null) return DateTime.fromMillisecondsSinceEpoch(millis);
             }
             // Fallback: Try parse from body if needed (for legacy)
             // Prioritize creation time over ID
             return DateTime.now(); 
          } catch (_) {}
          return DateTime.fromMillisecondsSinceEpoch(0);
       }
       
       final timeA = getTime(a);
       final timeB = getTime(b);
       
       // Compare Time
       final comparison = timeA.compareTo(timeB);
       
       // If same time (rare), use ID as tie breaker
       if (comparison == 0) {
          return a.id.compareTo(b.id);
       }
       
       return _isNewestFirst ? -comparison : comparison; // Newest First = Descending
    });
    
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _readStatus.values.where((read) => !read).length;
    final displayList = _filteredNotifications;

    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: primaryGradientStart,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: pendingNotifications.isNotEmpty
            ? [
                // SORT MENU
                PopupMenuButton<bool>(
                  icon: const Icon(Icons.sort_rounded, color: Colors.white, size: 28),
                  tooltip: 'Sắp xếp',
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  offset: const Offset(0, 56),
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: true,
                      child: Row(
                        children: [
                          Icon(Icons.arrow_upward_rounded, 
                               color: _isNewestFirst ? primaryGradientEnd : Colors.grey),
                          const SizedBox(width: 12),
                          Text('Mới nhất', 
                               style: TextStyle(
                                 fontWeight: _isNewestFirst ? FontWeight.bold : FontWeight.normal,
                                 color: _isNewestFirst ? primaryGradientEnd : Colors.black87
                               )),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: false,
                      child: Row(
                        children: [
                          Icon(Icons.arrow_downward_rounded, 
                               color: !_isNewestFirst ? primaryGradientEnd : Colors.grey),
                          const SizedBox(width: 12),
                          Text('Cũ nhất', 
                               style: TextStyle(
                                 fontWeight: !_isNewestFirst ? FontWeight.bold : FontWeight.normal,
                                 color: !_isNewestFirst ? primaryGradientEnd : Colors.black87
                               )),
                        ],
                      ),
                    ),
                  ],
                  onSelected: (value) {
                    setState(() {
                      _isNewestFirst = value;
                    });
                  },
                ),
                
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert_rounded, color: Colors.white, size: 28),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  offset: const Offset(0, 56),
                  itemBuilder: (context) => [
                    if (unreadCount > 0)
                      const PopupMenuItem(
                        value: 'read_all',
                        child: Row(
                          children: [
                            Icon(Icons.done_all, color: deepBlue),
                            SizedBox(width: 12),
                            Text('Đánh dấu đã đọc tất cả', style: TextStyle(fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    const PopupMenuItem(
                      value: 'clear_all',
                      child: Row(
                        children: [
                          Icon(Icons.delete_sweep, color: Colors.redAccent),
                          SizedBox(width: 12),
                          Text('Xóa tất cả thông báo', style: TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ],
                  onSelected: (value) {
                    if (value == 'read_all') _markAllAsRead();
                    if (value == 'clear_all') _cancelAll();
                  },
                ),
                const SizedBox(width: 8),
              ]
            : null,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [primaryGradientStart, primaryGradientEnd],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // HEADER BANNER
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 10, 24, 24),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.notifications_active_rounded, color: Colors.white, size: 32),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Thông báo & Cập nhật',
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$unreadCount tin chưa đọc',
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 13),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // MAIN BODY (White Container)
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: backgroundLight,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
                  ),
                  child: Column(
                    children: [
          // FILTER CHIPS
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['Tất cả', 'Chưa đọc', 'Vé & Thanh toán', 'Nhắc nhở khởi hành'].map((filter) {
                  final isSelected = _selectedFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(filter),
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : deepBlue,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        fontSize: 13,
                      ),
                      selected: isSelected,
                      onSelected: (bool selected) {
                        setState(() {
                          _selectedFilter = filter;
                        });
                      },
                      backgroundColor: Colors.white,
                      selectedColor: primaryGradientEnd,
                      checkmarkColor: Colors.white,
                      side: BorderSide(
                        color: isSelected ? Colors.transparent : Colors.grey.shade300,
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          
          // LIST
          Expanded(
            child: pendingNotifications.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [BoxShadow(color: Colors.grey.withAlpha(51), blurRadius: 20, offset: const Offset(0, 10))],
                      ),
                      child: Icon(Icons.notifications_off_rounded, size: 90, color: Colors.grey[400]),
                    ),
                    const SizedBox(height: 32),
                    const Text('Chưa có thông báo', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: deepBlue)),
                    const SizedBox(height: 12),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 40),
                      child: Text(
                        'Chúng tôi sẽ gửi thông báo khi bạn đặt vé thành công hoặc nhắc nhở trước giờ xe chạy',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 15, color: Colors.grey[600], height: 1.5),
                      ),
                    ),
                  ],
                ),
              )
            : displayList.isEmpty 
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(30.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.filter_list_off, size: 64, color: Colors.grey[300]),
                        const SizedBox(height: 16),
                        Text(
                          'Không có thông báo nào trong mục "$_selectedFilter"',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey[600], fontSize: 16),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                onRefresh: _loadPendingNotifications,
                color: primaryGradientStart,
                backgroundColor: Colors.white,
                strokeWidth: 3,
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                  itemCount: displayList.length,
                  itemBuilder: (context, index) {
                    final noti = displayList[index];
                  final bool isRead = _readStatus[noti.id] ?? false;
                  final payloadParts = noti.payload?.split('|') ?? [];
                  final rawPayload = payloadParts.isNotEmpty ? payloadParts[0] : (noti.payload ?? '');
                  final NotiStyle style = _getNotiStyle(rawPayload);
                  
                  // Timestamp Parsing
                  DateTime? timestamp;
                  if (payloadParts.length > 1) {
                    try {
                      final millis = int.tryParse(payloadParts[1]);
                      if (millis != null) timestamp = DateTime.fromMillisecondsSinceEpoch(millis);
                    } catch (_) {}
                  }
                  if (timestamp == null) timestamp = DateTime.tryParse(rawPayload);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 18),
                    child: Card(
                      elevation: isRead ? 2 : 8,
                      shadowColor: isRead 
                          ? Colors.grey.withAlpha(20) 
                          : style.bgColor.withOpacity(0.4),
                      color: isRead 
                          ? Colors.white 
                          : style.bgColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(26),
                        side: isRead ? BorderSide.none : BorderSide(color: style.iconColor.withOpacity(0.1), width: 1),
                      ),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(26),
                        onTap: () async {
                          if (!isRead) {
                            setState(() => _readStatus[noti.id] = true);
                            
                            if (noti.id >= 3000000) {
                               if (_currentUserId != null) {
                                  final repo = NotificationRepository();
                                  if (kDebugMode) print('MARKING READ: ID ${noti.id - 3000000} for USER $_currentUserId');
                                  final success = await repo.markAsRead(noti.id - 3000000, _currentUserId!);
                                  if (kDebugMode) print('MARK READ RESULT: $success');
                               } else {
                                  if (kDebugMode) print('CANNOT MARK READ: User ID is null');
                               }
                            } else {
                                final prefs = await SharedPreferences.getInstance();
                                final readIds = prefs.getStringList('read_notifications') ?? [];
                                if (!readIds.contains(noti.id.toString())) {
                                  readIds.add(noti.id.toString());
                                  await prefs.setStringList('read_notifications', readIds);
                                }
                            }
                            if (mounted) context.read<NotificationBloc>().add(LoadNotificationsEvent(userId: _currentUserId));
                          }
                        },
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(22, 22, 18, 22),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Stack(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(15),
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: isRead 
                                          ? [Colors.grey.shade300, Colors.grey.shade400]
                                          : [style.iconColor, style.iconColor.withOpacity(0.8)],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                                      shape: BoxShape.circle,
                                      boxShadow: isRead ? [] : [
                                         BoxShadow(
                                           color: style.iconColor.withOpacity(0.3),
                                           blurRadius: 8,
                                           offset: const Offset(0, 4),
                                         )
                                      ]
                                    ),
                                    child: Icon(
                                      style.icon,
                                      color: Colors.white,
                                      size: 32, // Slightly smaller icon
                                    ),
                                  ),
                                  if (!isRead)
                                    Positioned(
                                      right: 2,
                                      top: 2,
                                      child: Container(
                                        width: 14,
                                        height: 14,
                                        decoration: BoxDecoration(
                                          color: Colors.redAccent,
                                          shape: BoxShape.circle,
                                          border: Border.all(color: style.bgColor, width: 2),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(width: 18),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      noti.title ?? 'Thông báo',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                        color: isRead ? Colors.black54 : style.textColor,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      (noti.body ?? '').replaceAll(RegExp(r'\nĐặt lúc:.*'), ''),
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: isRead ? Colors.black45 : Colors.black87,
                                        height: 1.4,
                                      ),
                                    ),
                                    if (timestamp != null) ...[
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          Icon(Icons.access_time_rounded, size: 16, color: isRead ? Colors.black38 : style.iconColor),
                                          const SizedBox(width: 6),
                                          Text(
                                            _formatBookingTime(timestamp),
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: isRead ? Colors.black38 : style.iconColor,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: Icon(Icons.close_rounded, color: Colors.grey.shade400, size: 20),
                                onPressed: () async {
                                  await FlutterLocalNotificationsPlugin().cancel(noti.id);
                                  setState(() {
                                    pendingNotifications.removeAt(index);
                                    _readStatus.remove(noti.id);
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
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

  String _formatBookingTime(DateTime date) {
    final now = DateTime.now();
    final localDate = date.toLocal();
    if (localDate.year == now.year && localDate.month == now.month && localDate.day == now.day) {
      return 'Hôm nay, ${localDate.hour.toString().padLeft(2, '0')}:${localDate.minute.toString().padLeft(2, '0')}';
    }
    return '${localDate.day}/${localDate.month} ${localDate.hour.toString().padLeft(2, '0')}:${localDate.minute.toString().padLeft(2, '0')}';
  }

  // HELPER: Map 8 Colors per User Request
  NotiStyle _getNotiStyle(String payload) {
     if (payload.startsWith('booking_success')) {
        return NotiStyle(const Color(0xFFE8F5E9), Colors.green.shade700, const Color(0xFF1B5E20), Icons.receipt_long_rounded); // 1. BOOKING SUCCESS (Local): Green Mint
     }
     if (payload.startsWith('payment_success')) {
        return NotiStyle(const Color(0xFFE0F2F1), Colors.teal.shade700, const Color(0xFF004D40), Icons.payments_rounded); // 2. PAYMENT SUCCESS (Server): Teal Aqua
     }
     if (payload.startsWith('payment_reminder')) {
        return NotiStyle(const Color(0xFFFFFDE7), Colors.orangeAccent.shade700, const Color(0xFFFF6F00), Icons.savings_rounded); // 3. PAYMENT REMINDER: Yellow/Orange
     }
     if (payload.startsWith('boarding_success')) {
        return NotiStyle(const Color(0xFFE3F2FD), Colors.blue.shade700, const Color(0xFF0D47A1), Icons.verified_user_rounded); // 4. BOARDING SUCCESS: Blue
     }
     if (payload.startsWith('departure_reminder')) {
        return NotiStyle(const Color(0xFFFFF3E0), Colors.deepOrange.shade600, const Color(0xFFBF360C), Icons.departure_board_rounded); // 5. DEPARTURE: Orange Peach
     }
     if (payload.startsWith('ticket_cancelled') || payload.startsWith('ticket_expired')) {
        return NotiStyle(const Color(0xFFFFEBEE), Colors.red.shade600, const Color(0xFFB71C1C), Icons.confirmation_number_rounded); // 6. EXPIRED/CANCELLED: Red Rose
     }
     if (payload.startsWith('review_reminder')) {
        return NotiStyle(const Color(0xFFF3E5F5), Colors.purple.shade600, const Color(0xFF4A148C), Icons.rate_review_rounded); // 7. REVIEW: Purple Lavender
     }
     if (payload.startsWith('open_my_reviews')) {
        return NotiStyle(const Color(0xFFFCE4EC), Colors.pink.shade600, const Color(0xFF880E4F), Icons.rule_rounded); // 8. UNREVIEWED: Pink
     }
     
     // Default
     return NotiStyle(Colors.white, Colors.blueGrey, Colors.blueGrey.shade800, Icons.notifications_rounded);
  }
}

class NotiStyle {
  final Color bgColor;
  final Color iconColor;
  final Color textColor;
  final IconData icon;
  
  NotiStyle(this.bgColor, this.iconColor, this.textColor, this.icon);
}