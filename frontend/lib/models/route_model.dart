class RouteModel {
  final int id;
  final String startPoint;
  final String endPoint;

  RouteModel({
    required this.id,
    required this.startPoint,
    required this.endPoint,
  });

  factory RouteModel.fromJson(Map<String, dynamic> json) {
    return RouteModel(
      id: json['id'],
      startPoint: json['startPoint'],
      endPoint: json['endPoint'],
    );
  }
}
