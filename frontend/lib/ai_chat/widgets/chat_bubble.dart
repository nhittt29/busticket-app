import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

class ChatBubble extends StatelessWidget {
  final String text;
  final bool isUser;
  final String? avatarUrl;

  const ChatBubble({super.key, required this.text, required this.isUser, this.avatarUrl});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Row(
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withValues(alpha: 0.3),
                    blurRadius: 5,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Image.asset(
                'assets/images/bus_logo.png', // Logo Hãng xe
                width: 24,
                height: 24,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isUser ? const Color(0xFF1976D2) : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: isUser
                      ? const Radius.circular(16)
                      : const Radius.circular(2),
                  bottomRight: isUser
                      ? const Radius.circular(2)
                      : const Radius.circular(16),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withValues(alpha: 0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: isUser
                  ? Text(
                      text,
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                    )
                  : MarkdownBody(
                      data: text,
                      styleSheet: MarkdownStyleSheet(
                        p: const TextStyle(fontSize: 16, color: Colors.black87),
                        listBullet: const TextStyle(
                            fontSize: 16, color: Colors.black87),
                      ),
                    ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 8),
            if (avatarUrl != null && avatarUrl!.startsWith('http'))
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: Colors.white,
                        width: 2), // White border like standard chat heads
                    boxShadow: [
                      BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 4,
                          offset: const Offset(0, 2))
                    ]),
                child: ClipOval(
                  child: FadeInImage.assetNetwork(
                    placeholder: 'assets/images/default.png',
                    image: avatarUrl!,
                    fit: BoxFit.cover,
                    imageErrorBuilder: (context, error, stackTrace) {
                      return const CircleAvatar(
                        backgroundColor: Color(0xFFE3F2FD),
                        child: Icon(Icons.person, color: Color(0xFF1976D2)),
                      );
                    },
                  ),
                ),
              )
            else
              const CircleAvatar(
                backgroundColor: Color(0xFFE3F2FD),
                child: Icon(Icons.person, color: Color(0xFF1976D2)),
              ),
          ],
        ],
      ),
    );
  }
}
