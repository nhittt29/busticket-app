class Brand {
  final int id;
  final String name;
  final String? image;

  Brand({required this.id, required this.name, this.image});

  factory Brand.fromJson(Map<String, dynamic> json) {
    return Brand(
      id: json['id'],
      name: json['name'],
      image: json['image'],
    );
  }
}
