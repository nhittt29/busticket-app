class Review {
  final int id;
  final int rating;
  final String? comment;
  final int userId;
  final int busId;
  final int ticketId;
  final DateTime createdAt;
  final String? userName;
  final String? userAvatar;

  Review({
    required this.id,
    required this.rating,
    this.comment,
    required this.userId,
    required this.busId,
    required this.ticketId,
    required this.createdAt,
    this.userName,
    this.userAvatar,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      rating: json['rating'],
      comment: json['comment'],
      userId: json['userId'],
      busId: json['busId'],
      ticketId: json['ticketId'],
      createdAt: DateTime.parse(json['createdAt']),
      userName: json['user']?['name'],
      userAvatar: json['user']?['avatar'],
    );
  }
}
