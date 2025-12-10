import '../cubit/booking_state.dart';

class SeatLogic {
  /// Kiểm tra xem việc chọn ghế [candidate] có tạo ra ghế lẻ (orphan) không.
  /// Trả về true nếu VI PHẠM (tạo ra ghế lẻ).
  static bool wouldCreateOrphan(
    Seat candidate,
    List<Seat> allSeats,
    List<Seat> currentSelectedSeats, {
    bool isCoach45 = false,
    bool isCoach28 = false,
  }) {
    List<Seat> group;

    if (isCoach45) {
      // Logic riêng cho xe 45 chỗ (COACH):
      // - 40 ghế đầu (hàng đôi): KHÔNG áp dụng check ghế lẻ.
      // - 5 ghế cuối: KHÔNG được để trống 1 ghế ở giữa (Inner Orphan), cho phép tối đa 1 ghế lẻ ở bìa.
      final sorted = List<Seat>.from(allSeats)..sort((a, b) => a.id.compareTo(b.id)); // Sort theo ID như Frontend
      final index = sorted.indexWhere((s) => s.id == candidate.id);
      
      if (index < 40) return false; // Hàng đôi -> Cho phép chọn tự do
      
      group = sorted.skip(40).take(5).toList(); // Nhóm 5 ghế cuối
    } else if (isCoach28) {
      // Logic riêng cho xe 28 chỗ (COACH):
      // - 24 ghế đầu (hàng đôi): KHÔNG áp dụng check ghế lẻ.
      // - 4 ghế cuối (hàng ngang): KHÔNG được để trống 1 ghế ở giữa.
      final sorted = List<Seat>.from(allSeats)..sort((a, b) => a.id.compareTo(b.id)); // Sort theo ID
      final index = sorted.indexWhere((s) => s.id == candidate.id);

      if (index < 24) return false; // Hàng đôi -> Cho phép chọn tự do
      
      group = sorted.skip(24).take(4).toList(); // Nhóm 4 ghế cuối
    } else {
      // 1. Xác định nhóm ghế của candidate (Cùng hàng hoặc cùng cụm)
      group = _getSeatGroup(candidate, allSeats);
    }

    // Nếu nhóm chỉ có 1 ghế hoặc ghế này độc lập -> Không vi phạm
    if (group.length <= 1) return false;

    // 2. Tạo danh sách các ghế SẼ ĐƯỢC CHỌN (giả lập)
    // 2. Tạo danh sách các ghế SẼ ĐƯỢC CHỌN (giả lập)
    final simulatedSelection = List<Seat>.from(currentSelectedSeats);
    
    // Đảm bảo dùng ID check
    final exists = simulatedSelection.any((s) => s.id == candidate.id);
    if (!exists) {
      simulatedSelection.add(candidate);
    }
    // LƯU Ý: Không return false ở đây nữa, để cho phép check cả những ghế đang có trong list.

    // 3. Kiểm tra trạng thái của cả nhóm ghế xem có generated gap = 1 không
    // Map trạng thái: 0 = Trống (Available), 1 = Đã/Đang chọn (Ticketed/Selected), -1 = Blocked/Sold
    List<int> states = group.map((seat) {
      if (seat.status != 'AVAILABLE') return 1; // Đã bán coi như đã lấp đầy
      if (simulatedSelection.any((s) => s.id == seat.id)) return 1; // Đang chọn
      return 0; // Trống
    }).toList();

    // 4. Quét tìm orphan (ghế trống) và phân loại
    // Luật mới:
    // - KHÔNG được phép có orphan "kẹp giữa" (Inner Hole size 1). -> Chặn tuyệt đối.
    // - ĐƯỢC phép có tối đa 1 orphan "bìa" (Outer Hole size 1). 
    //   -> Tại sao? Vì nhóm 3 ghế (A, B, C), nếu chọn A, B thì còn lại C (Orphan bìa). Phải cho phép.
    //   -> Nhưng nếu chọn B, thì còn lại A (Bìa) và C (Bìa) -> 2 Orphan -> Chặn.
    
    int outerOrphans = 0;
    int currentGapSize = 0;
    bool gapStarted = false;

    for (int i = 0; i < states.length; i++) {
      if (states[i] == 0) {
        currentGapSize++;
        gapStarted = true;
      } else {
        if (gapStarted) {
          // Kết thúc 1 gap
          // Kiểm tra xem gap này là Inner hay Outer (bắt đầu từ đầu dãy?)
          bool isAtStart = (i - currentGapSize == 0);
          
          if (currentGapSize == 1) {
            if (isAtStart) {
              outerOrphans++;
            } else {
              // Gap kẹp giữa (vì bên trái là 1 (do vòng lặp trước), bên phải là 1 (hiện tại))
              return true; // INNER ORPHAN -> CHẶN NGAY
            }
          }
          currentGapSize = 0;
          gapStarted = false;
        }
      }
    }

    // Check gap cuối cùng (nếu dãy kết thúc bằng 0)
    if (gapStarted) {
      if (currentGapSize == 1) {
        outerOrphans++;
      }
    }

    // Nếu có quá 1 ghế lẻ ở bìa (VD: chọn B, hổng A và C) -> Chặn
    if (outerOrphans > 1) return true;

    return false;
  }

  /// Xác định nhóm các ghế liên quan nhau (Row neighbors)
  static List<Seat> _getSeatGroup(Seat target, List<Seat> allSeats) {
    // 1. Phân loại theo cấu trúc xe dựa trên tổng số ghế
    // Logic này phải khớp với cách Frontend render (SelectBusScreen.dart)
    
    // Tách ghế theo tầng và SORT để đảm bảo thứ tự A->B->C (Column Order)
    final sameFloorSeats = allSeats.where((s) => s.floor == target.floor).toList();
    
    // Sort alpha-numeric chuẩn xác: Prefix (Cột) -> Number (Hàng)
    // VD: A1, A2, ..., A10, B1...
    sameFloorSeats.sort((a, b) {
      // 1. Tách Prefix (Chữ) và Suffix (Số)
      final aPrefix = a.seatNumber.replaceAll(RegExp(r'[0-9]'), '');
      final bPrefix = b.seatNumber.replaceAll(RegExp(r'[0-9]'), '');
      
      final aNumStr = a.seatNumber.replaceAll(RegExp(r'[^0-9]'), '');
      final bNumStr = b.seatNumber.replaceAll(RegExp(r'[^0-9]'), '');
      final aNum = int.tryParse(aNumStr) ?? 0;
      final bNum = int.tryParse(bNumStr) ?? 0;

      // 2. So sánh Prefix trước (Gom nhóm cột A, B, C)
      int prefixCompare = aPrefix.compareTo(bPrefix);
      if (prefixCompare != 0) return prefixCompare;

      // 3. Nếu cùng cột -> So sánh số (để xếp đúng hàng 1, 2, 10...)
      return aNum.compareTo(bNum);
    });
    // Sort theo ID hoặc thứ tự xuất hiện (giả định list truyền vào đã sort đúng như Frontend)
    // Nếu chưa chắc chắn, ta nên sort giống repository: floor ASC, seatNumber ASC.
    // Tuy nhiên, ở Cubit state.seats thường đã được load từ Repo và sort rồi.
    
    // --- LAYOUT 34 GIƯỜNG ---
    if (allSeats.length == 34) {
       // Cấu trúc mỗi tầng Frontend: 3 cột [6, 5, 6]
       return _findRowNeighborsByColumns(target, sameFloorSeats, [6, 5, 6]);
    }

    // --- LAYOUT 41 GIƯỜNG ---
    if (allSeats.length == 41) {
       // Logic phức tạp từ Frontend (SelectBusScreen.dart - SeatLayout41Form):
       // Back Row (5 ghế) = 2 ghế cuối tầng trên + 3 ghế cuối tầng dưới.
       
       // 1. Lấy danh sách (giả định đã sort đúng theo thứ tự hiển thị hoặc row-based)
       // KHÔNG DÙNG _sortSeats (vì nó sort theo cột A->B->C, làm vỡ logic Round Robin của Layout này)
       // Ta tin tưởng vào thứ tự của list gốc (hoặc sort cơ bản id/seatNumber nếu cần)
       // Tuy nhiên, SelectBusScreen dùng logic i % 3, tức là list phải có dạng [A1, B1, C1, A2, B2...]
       
       final lowerSeats = allSeats.where((s) => s.floor == 1).toList();
       final upperSeats = allSeats.where((s) => s.floor == 2).toList();
       
       // 2. Xác định các ghế "Moved" (3 ghế cuối tầng dưới dời lên)
       // Logic gốc: movedSeats = lowerSeats.skip(18).take(3)
       // (Lưu ý: lowerSeats có thể > 18. Nếu < 18 thì take(3) sẽ lấy ít hơn, ko sao)
       final movedSeats = lowerSeats.skip(18).take(3).toList();
       
       // 3. Xác định các ghế "Last Row Upper" (2 ghế cuối tầng trên)
       // Logic gốc: lastRowUpperSeats = upperSeats.skip(18).take(2)
       final lastRowUpperSeats = upperSeats.skip(18).take(2).toList();
       
       // 4. Các ghế còn lại (Main Rows - Thân xe)
       final mainLower = lowerSeats.take(18).toList(); // 18 ghế đầu tầng dưới
       final mainUpper = upperSeats.take(18).toList(); // 18 ghế đầu tầng trên
       
       // 5. Build nhóm "Hàng cuối" (Back Row)
       // Thứ tự Visual trong Row: [ ...lastRowUpperSeats, ...movedSeats ]
       final backRow = [...lastRowUpperSeats, ...movedSeats];
       
       // 6. Kiểm tra Target thuộc nhóm nào?
       
       // Check ID trong Back Row
       if (backRow.any((s) => s.id == target.id)) {
         return backRow; // Trả về nguyên nhóm 5 ghế
       }
       
       // Nếu thuộc Main Lower (18 ghế) -> Dùng ROUND ROBIN (3 cột)
       if (mainLower.any((s) => s.id == target.id)) {
         return _findRowNeighborsByRoundRobin(target, mainLower, 3);
       }
       
       // Nếu thuộc Main Upper (18 ghế) -> Dùng ROUND ROBIN (3 cột)
       if (mainUpper.any((s) => s.id == target.id)) {
         return _findRowNeighborsByRoundRobin(target, mainUpper, 3);
       }
       
       // Fallback
       return [target];
    }
    
    // --- LAYOUT 44/45 GIƯỜNG (Mặc định) ---
    // Thường dùng Round Robin
    return _findRowNeighborsByRoundRobin(target, sameFloorSeats, 3);
  }

  // Logic tìm hàng xóm cho Layout chia block (VD: [6, 5, 6])
  static List<Seat> _findRowNeighborsByColumns(Seat target, List<Seat> floorSeats, List<int> colCounts) {
    // 1. Xây dựng cấu trúc Columns
    List<List<Seat>> columns = [];
    int index = 0;
    for (int count in colCounts) {
      if (index + count <= floorSeats.length) {
        columns.add(floorSeats.sublist(index, index + count));
        index += count;
      } else {
        // Hết ghế
        columns.add(floorSeats.sublist(index));
        index = floorSeats.length;
      }
    }

    // 2. Tìm vị trí (colIndex, rowIndex) của target
    int targetColIndex = -1;
    int targetRowIndex = -1;

    for (int c = 0; c < columns.length; c++) {
      // Dùng ID để tìm kiếm thay vì object reference (tránh lỗi instance khác nhau)
      int r = columns[c].indexWhere((s) => s.id == target.id);
      if (r != -1) {
        targetColIndex = c;
        targetRowIndex = r;
        break;
      }
    }

    if (targetRowIndex == -1) return [target];

    // 3. Lấy các ghế ở cùng rowIndex từ các cột khác
    List<Seat> neighbors = [];
    for (int c = 0; c < columns.length; c++) {
      if (targetRowIndex < columns[c].length) {
        neighbors.add(columns[c][targetRowIndex]);
      }
    }
    
    // Sort lại cho đúng trật tự trái -> phải (để logic check gap hoạt động đúng)
    // Giả định thứ tự cột từ 0..N là trái -> phải
    return neighbors;
  }

  // Logic tìm hàng xóm cho Layout chia Round Robin (i % cols)
  static List<Seat> _findRowNeighborsByRoundRobin(Seat target, List<Seat> floorSeats, int colCount) {
     int index = floorSeats.indexOf(target);
     if (index == -1) return [target];

     // Row index trong Round Robin chính là: index div colCount
     int rowIndex = index ~/ colCount;
     
     // Tìm tất cả ghế có cùng rowIndex
     List<Seat> neighbors = [];
     for (int i = 0; i < floorSeats.length; i++) {
       if ((i ~/ colCount) == rowIndex) {
         neighbors.add(floorSeats[i]);
       }
     }
     
     return neighbors;
  }
  /// Tìm các ghế không hợp lệ trong danh sách đã chọn (dùng cho Auto-Deselect)
  static List<Seat> findInvalidSeats(List<Seat> allSeats, List<Seat> currentSelected, {bool isCoach45 = false, bool isCoach28 = false}) {
    final invalid = <Seat>{};
    for (final seat in currentSelected) {
      if (wouldCreateOrphan(seat, allSeats, currentSelected, isCoach45: isCoach45, isCoach28: isCoach28)) {
        invalid.add(seat);
      }
    }
    return invalid.toList();
  }
  
  static void _sortSeats(List<Seat> seats) {
    seats.sort((a, b) {
      final aPrefix = a.seatNumber.replaceAll(RegExp(r'[0-9]'), '');
      final bPrefix = b.seatNumber.replaceAll(RegExp(r'[0-9]'), '');
      
      final aNumStr = a.seatNumber.replaceAll(RegExp(r'[^0-9]'), '');
      final bNumStr = b.seatNumber.replaceAll(RegExp(r'[^0-9]'), '');
      final aNum = int.tryParse(aNumStr) ?? 0;
      final bNum = int.tryParse(bNumStr) ?? 0;

      int prefixCompare = aPrefix.compareTo(bPrefix);
      if (prefixCompare != 0) return prefixCompare;

      return aNum.compareTo(bNum);
    });
  }
}
