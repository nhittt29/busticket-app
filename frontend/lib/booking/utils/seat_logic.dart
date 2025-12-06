import '../cubit/booking_state.dart';

class SeatLogic {
  /// Kiểm tra xem việc chọn ghế [candidate] có tạo ra ghế lẻ (orphan) không.
  /// Trả về true nếu VI PHẠM (tạo ra ghế lẻ).
  static bool wouldCreateOrphan(
    Seat candidate,
    List<Seat> allSeats,
    List<Seat> currentSelectedSeats,
  ) {
    // 1. Xác định nhóm ghế của candidate (Cùng hàng hoặc cùng cụm)
    final group = _getSeatGroup(candidate, allSeats);

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
       // Tầng 1: 3 cột [6, 5, 6] ? -> Cần check lại code SeatLayout41Form
       // Tầng 2: Phức tạp hơn (Main 18 + Last Row).
       // Để đơn giản và an toàn, ta dùng logic Columns cơ bản cho phần thân.
       // SeatLayout41Form: 
       // Lower: 3 cột (giống 34?) -> code dùng _buildFloor("Tầng dưới", ..., lower, 3).
       //       _buildFloor logic: chia đều columns?
       //       Check _buildFloor: cols[i % columnCount].add(seats[i]). 
       //       => CHIA THEO MÔ ĐUN (Round Robin)!? 
       //       Khác với [6, 5, 6] (Sequential block).
       
       // QUAN TRỌNG: Cần kiểm tra lại SelectBusScreen.dart để xem logic chia cột chính xác.
       // Ở bước đọc file trước đó:
       // Layout 34 dùng _buildFloorSide -> [6, 5, 6] (Sequential)
       // Layout 41 dùng _buildFloor -> i % columnCount (Round Robin)
       
       if (target.floor == 1) {
         // Tầng dưới 41 ghế dùng _buildFloor với columnCount = 3 (Round Robin)
         return _findRowNeighborsByRoundRobin(target, sameFloorSeats, 3);
       } else {
         // Tầng trên 41 ghế: Main 18 (Round Robin 3 cols) + Last Row
         // Chấp nhận logic tương đối cho tầng trên
         return _findRowNeighborsByRoundRobin(target, sameFloorSeats, 3); 
       }
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
  static List<Seat> findInvalidSeats(List<Seat> allSeats, List<Seat> currentSelected) {
    final invalid = <Seat>{};
    for (final seat in currentSelected) {
      if (wouldCreateOrphan(seat, allSeats, currentSelected)) {
        invalid.add(seat);
      }
    }
    return invalid.toList();
  }
}
