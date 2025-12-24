import 'package:flutter/material.dart';

class LocationSelectionScreen extends StatefulWidget {
  final String title;
  final List<String> locations;

  const LocationSelectionScreen({
    super.key,
    required this.title,
    required this.locations,
  });

  @override
  State<LocationSelectionScreen> createState() => _LocationSelectionScreenState();
}

class _LocationSelectionScreenState extends State<LocationSelectionScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<String> _filteredLocations = [];

  @override
  void initState() {
    super.initState();
    _filteredLocations = widget.locations;
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      _filteredLocations = widget.locations
          .where((loc) => loc.toLowerCase().contains(query))
          .toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Tìm tỉnh/thành phố...',
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              ),
            ),
          ),
          
          // Location List
          Expanded(
            child: _filteredLocations.isEmpty
                ? Center(
                    child: Text(
                      'Không tìm thấy địa điểm nào',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  )
                : ListView.separated(
                    itemCount: _filteredLocations.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, index) {
                      final location = _filteredLocations[index];
                      return ListTile(
                        leading: const Icon(Icons.location_on_outlined, color: Colors.blueAccent),
                        title: Text(
                          location,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                        ),
                        onTap: () {
                          Navigator.pop(context, location);
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
