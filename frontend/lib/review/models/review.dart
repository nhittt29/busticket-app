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
  final List<String> images;
  final String? reply;
  final DateTime? repliedAt;

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
    this.images = const [],
    this.reply,
    this.repliedAt,
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
      images: (json['images'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      reply: json['reply'],
      repliedAt: json['repliedAt'] != null ? DateTime.parse(json['repliedAt']) : null,
    );
  }
}
