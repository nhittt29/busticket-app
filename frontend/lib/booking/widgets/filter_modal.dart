import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class FilterModal extends StatefulWidget {
  final Function({
    double? minPrice,
    double? maxPrice,
    String? startTime,
    String? endTime,
    String? busType,
    int? brandId,
    String? dropoffPoint,
    String? sortBy,
  }) onApply;

  const FilterModal({super.key, required this.onApply});

  @override
  State<FilterModal> createState() => _FilterModalState();
}

class _FilterModalState extends State<FilterModal> {
  RangeValues _priceRange = const RangeValues(0, 2000000);
  String? _selectedTimeRange; // 'morning', 'afternoon', 'evening', 'night'
  String? _selectedBusType;
  String? _dropoffPoint;
  String _sortBy = 'time_asc';
  final TextEditingController _dropoffController = TextEditingController();

  @override
  void dispose() {
    _dropoffController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Bộ lọc tìm kiếm',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const Divider(),
          Expanded(
            child: ListView(
              children: [
                // 1. Khoảng giá
                const Text('Khoảng giá', style: TextStyle(fontWeight: FontWeight.bold)),
                RangeSlider(
                  values: _priceRange,
                  min: 0,
                  max: 2000000,
                  divisions: 20,
                  labels: RangeLabels(
                    NumberFormat.currency(locale: 'vi', symbol: 'đ').format(_priceRange.start),
                    NumberFormat.currency(locale: 'vi', symbol: 'đ').format(_priceRange.end),
                  ),
                  onChanged: (values) {
                    setState(() {
                      _priceRange = values;
                    });
                  },
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(NumberFormat.currency(locale: 'vi', symbol: 'đ').format(_priceRange.start)),
                    Text(NumberFormat.currency(locale: 'vi', symbol: 'đ').format(_priceRange.end)),
                  ],
                ),
                const SizedBox(height: 16),

                // 2. Giờ khởi hành
                const Text('Giờ khởi hành', style: TextStyle(fontWeight: FontWeight.bold)),
                Wrap(
                  spacing: 8,
                  children: [
                    _buildTimeChip('Sáng (06:00 - 12:00)', '06:00', '12:00', 'morning'),
                    _buildTimeChip('Chiều (12:00 - 18:00)', '12:00', '18:00', 'afternoon'),
                    _buildTimeChip('Tối (18:00 - 24:00)', '18:00', '23:59', 'evening'),
                    _buildTimeChip('Đêm (00:00 - 06:00)', '00:00', '06:00', 'night'),
                  ],
                ),
                const SizedBox(height: 16),

                // 3. Loại xe
                const Text('Loại xe', style: TextStyle(fontWeight: FontWeight.bold)),
                Wrap(
                  spacing: 8,
                  children: [
                    _buildChoiceChip('Ghế ngồi', 'MINIVAN', _selectedBusType, (val) => setState(() => _selectedBusType = val)),
                    _buildChoiceChip('Giường nằm', 'SLEEPER', _selectedBusType, (val) => setState(() => _selectedBusType = val)),
                    _buildChoiceChip('Limousine', 'LIMOUSINE', _selectedBusType, (val) => setState(() => _selectedBusType = val)),
                  ],
                ),
                const SizedBox(height: 16),

                // 4. Điểm trả khách
                const Text('Điểm trả khách', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                TextField(
                  controller: _dropoffController,
                  decoration: const InputDecoration(
                    hintText: 'Nhập tên bến xe, địa điểm...',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.location_on_outlined),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                  onChanged: (value) {
                    _dropoffPoint = value;
                  },
                ),
                const SizedBox(height: 16),

                // 5. Sắp xếp
                const Text('Sắp xếp theo', style: TextStyle(fontWeight: FontWeight.bold)),
                RadioListTile<String>(
                  title: const Text('Giờ đi sớm nhất'),
                  value: 'time_asc',
                  groupValue: _sortBy,
                  onChanged: (val) => setState(() => _sortBy = val!),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile<String>(
                  title: const Text('Giờ đi muộn nhất'),
                  value: 'time_desc',
                  groupValue: _sortBy,
                  onChanged: (val) => setState(() => _sortBy = val!),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile<String>(
                  title: const Text('Giá thấp nhất'),
                  value: 'price_asc',
                  groupValue: _sortBy,
                  onChanged: (val) => setState(() => _sortBy = val!),
                  contentPadding: EdgeInsets.zero,
                ),
                RadioListTile<String>(
                  title: const Text('Giá cao nhất'),
                  value: 'price_desc',
                  groupValue: _sortBy,
                  onChanged: (val) => setState(() => _sortBy = val!),
                  contentPadding: EdgeInsets.zero,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    setState(() {
                      _priceRange = const RangeValues(0, 2000000);
                      _selectedTimeRange = null;
                      _selectedBusType = null;
                      _dropoffPoint = null;
                      _dropoffController.clear();
                      _sortBy = 'time_asc';
                    });
                  },
                  child: const Text('Đặt lại'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    String? startTime;
                    String? endTime;

                    if (_selectedTimeRange == 'morning') {
                      startTime = '06:00'; endTime = '12:00';
                    } else if (_selectedTimeRange == 'afternoon') {
                      startTime = '12:00'; endTime = '18:00';
                    } else if (_selectedTimeRange == 'evening') {
                      startTime = '18:00'; endTime = '23:59';
                    } else if (_selectedTimeRange == 'night') {
                      startTime = '00:00'; endTime = '06:00';
                    }

                    widget.onApply(
                      minPrice: _priceRange.start,
                      maxPrice: _priceRange.end,
                      startTime: startTime,
                      endTime: endTime,
                      busType: _selectedBusType,
                      dropoffPoint: _dropoffPoint?.isEmpty == true ? null : _dropoffPoint,
                      sortBy: _sortBy,
                    );
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Áp dụng'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimeChip(String label, String start, String end, String key) {
    final isSelected = _selectedTimeRange == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedTimeRange = selected ? key : null;
        });
      },
    );
  }

  Widget _buildChoiceChip(String label, String value, String? groupValue, Function(String?) onSelected) {
    final isSelected = groupValue == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        onSelected(selected ? value : null);
      },
    );
  }
}
