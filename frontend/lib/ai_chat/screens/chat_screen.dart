import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:lottie/lottie.dart';
import 'package:lottie/lottie.dart';
import 'package:emoji_picker_flutter/emoji_picker_flutter.dart';
import 'package:flutter/foundation.dart' as foundation;
import 'dart:io';
import '../services/ai_service.dart';
import '../widgets/chat_bubble.dart';
import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../booking/cubit/booking_cubit.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../../bloc/home/home_bloc.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _showEmoji = false;
  final List<Message> _messages = [];
  final AiService _aiService = AiService();
  
  // Voice
  late stt.SpeechToText _speech;
  bool _isListening = false;
  final FlutterTts _flutterTts = FlutterTts();

  bool _speechEnabled = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    _initSpeech();
    _initTts();

    _focusNode.addListener(() {
      if (_focusNode.hasFocus) {
        setState(() {
          _showEmoji = false;
        });
      }
    });
    
    // Greeting Message
    _messages.add(Message(
      text: "Xin chào! Mình là trợ lý ảo BusTicket. Mình có thể giúp gì cho bạn?",
      isUser: false,
    ));
  }

  void _initSpeech() async {
    _speechEnabled = await _speech.initialize(
        onStatus: (val) {
          debugPrint('Speech Status: $val');
          if (mounted) {
            setState(() {
              // Cập nhật trạng thái UI dựa trên status thực tế
              if (val == 'listening') {
                _isListening = true;
              } else if (val == 'notListening' || val == 'done') {
                _isListening = false;
              }
            });
          }
        },
        onError: (val) {
          debugPrint('Speech Error: $val');
          if (mounted) setState(() => _isListening = false);
        },
    );
    if (mounted) setState(() {});
  }

  void _initTts() async {
    await _flutterTts.setLanguage("vi-VN");
    await _flutterTts.setPitch(1.0);
  }

  void _onEmojiSelected(Category? category, Emoji emoji) {
    _controller.text = _controller.text + emoji.emoji;
    _controller.selection = TextSelection.fromPosition(
        TextPosition(offset: _controller.text.length));
  }

  void _onBackspacePressed() {
    _controller.text = _controller.text.characters.skipLast(1).toString();
    _controller.selection = TextSelection.fromPosition(
        TextPosition(offset: _controller.text.length));
  }

  void _toggleEmojiPicker() {
    if (_showEmoji) {
      _focusNode.requestFocus();
    } else {
      _focusNode.unfocus();
    }
    setState(() {
      _showEmoji = !_showEmoji;
    });
  }

  void _sendMessage() async {
    if (_controller.text.isEmpty) return;

    if (_isListening) {
      _speech.stop();
      setState(() => _isListening = false);
    }
    
    final text = _controller.text;
    setState(() {
      _messages.add(Message(text: text, isUser: true));
      _isLoading = true;
      _controller.clear();
    });

    // Call API
    final response = await _aiService.sendMessage(text);

    // Kiem tra neu la lenh JSON (Command Mode)
    if (_tryParseCommand(response)) return;

    setState(() {
      _isLoading = false;
      _messages.add(Message(text: response, isUser: false));
    });

    // Speak response (Optional - Auto speak or manual tap?)
    // await _flutterTts.speak(response); 
  }

  bool _tryParseCommand(String response) {
    try {
      // Clean markdown code blocks
      final cleanJson = response.replaceAll(RegExp(r'^```json\s*|\s*```$'), '').trim();
      if (cleanJson.startsWith('{') && cleanJson.endsWith('}')) {
        final data = jsonDecode(cleanJson);
        if (data['action'] == 'SEARCH_TRIP') {
          _handleSearchCommand(data);
          return true;
        }
      }
    } catch (e) {
      debugPrint("Error parsing AI command: $e");
    }
    return false;
  }

  void _handleSearchCommand(Map<String, dynamic> data) async {
      final cubit = context.read<BookingCubit>();
      
      // Reset state cu
      cubit.resetSearch();
      
      String from = data['from'] ?? '';
      String to = data['to'] ?? '';
      String dateStr = data['date'] ?? '';

      // Feedback Text
      String feedback = "Đang tìm chuyến xe";
      if (to.isNotEmpty) feedback += " đi $to";
      if (dateStr.isNotEmpty) feedback += " cho ngày $dateStr";
      
      setState(() {
        _isLoading = false;
        _messages.add(Message(
          text: "$feedback...", 
          isUser: false
        ));
      });
      
      await Future.delayed(const Duration(milliseconds: 800));
      
      // Update Cubit
      if (from.isNotEmpty) cubit.updateFrom(from);
      if (to.isNotEmpty) cubit.updateTo(to);
      if (dateStr.isNotEmpty) {
        try {
           cubit.selectDate(DateTime.parse(dateStr));
        } catch (_) {}
      }
      
      // Navigate
      if (mounted) {
         cubit.searchTrips(); // Trigger search
         Navigator.pushNamed(context, '/search-trips');
      }
  }

  void _listen() async {
    if (_isListening) {
      setState(() => _isListening = false);
      _speech.stop();
    } else {
      if (_speechEnabled) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (val) {
             setState(() {
               _controller.text = val.recognizedWords;
               if (val.finalResult) {
                 _isListening = false;
               }
             });
          },
          localeId: 'vi_VN',
          pauseFor: const Duration(seconds: 3), // Tự tắt sau 3 giây im lặng
          listenFor: const Duration(seconds: 30), // Tối đa 30 giây
          cancelOnError: true,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authUser = context.watch<AuthBloc>().state.user;
    final homeUser = context.watch<HomeBloc>().state.user;
    final user = authUser ?? homeUser;
    
    String? avatarUrl;
    if (user != null && user['avatar'] != null) {
      String raw = user['avatar'];
      if (raw.isNotEmpty) {
        raw = raw.replaceAll("\\", "/");
        if (!raw.startsWith('http')) {
          avatarUrl = 'http://10.0.2.2:3000/$raw';
        } else {
          avatarUrl = raw;
        }
      }
    }

    return PopScope(
      canPop: !_showEmoji,
      onPopInvokedWithResult: (didPop, result) {
         if (!didPop && _showEmoji) {
           setState(() => _showEmoji = false);
         }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF5F7FA), // Light background
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFE3F2FD),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.support_agent, color: Color(0xFF1976D2)),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Trợ lý ảo BusTicket",
                  style: TextStyle(
                    color: Colors.black87,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  "Luôn sẵn sàng hỗ trợ",
                  style: TextStyle(
                    color: Colors.green,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black54),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.only(top: 16, bottom: 10),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return ChatBubble(
                  text: msg.text, 
                  isUser: msg.isUser,
                  avatarUrl: msg.isUser ? avatarUrl : null,
                );
              },
            ),
          ),
          if (_isLoading)
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  const SizedBox(width: 16),
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
                        )
                      ],
                    ), 
                   child: Image.asset('assets/images/bus_logo.png', width: 24, height: 24)
                  ),
                  const SizedBox(width: 10),
                  // Simple loading indicator if lottie fails or just Text
                  const Text("Đang soạn tin...", style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)),
                  // Lottie.asset('assets/lottie_loading.json', width: 50, height: 30), // Need usage
                ],
              ),
            ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withValues(alpha: 0.1),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F7FA),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: TextField(
                      controller: _controller,
                      focusNode: _focusNode,
                      decoration: InputDecoration(
                        hintText: "Nhập câu hỏi...",
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        prefixIcon: IconButton(
                          icon: Icon(
                            _showEmoji ? Icons.keyboard : Icons.sentiment_satisfied_rounded,
                            color: Colors.grey[600],
                          ),
                          onPressed: _toggleEmojiPicker,
                        ),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: _listen,
                  child: CircleAvatar(
                    radius: 24,
                    backgroundColor: _isListening ? Colors.redAccent : Colors.grey[200],
                    child: Icon(
                      _isListening ? Icons.mic : Icons.mic_none,
                      color: _isListening ? Colors.white : Colors.black54,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: _sendMessage,
                  child: const CircleAvatar(
                    radius: 24,
                    backgroundColor: Color(0xFF1976D2),
                    child: Icon(Icons.send_rounded, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
          // EMOJI PICKER
          if (_showEmoji)
            SizedBox(
              height: 250,
              child: EmojiPicker(
                onEmojiSelected: _onEmojiSelected,
                onBackspacePressed: _onBackspacePressed,
                config: Config(
                  height: 250,
                  checkPlatformCompatibility: true,
                  viewOrderConfig: const ViewOrderConfig(),
                  emojiViewConfig: const EmojiViewConfig(
                    columns: 7,
                    emojiSizeMax: 28, // Platform dependent default is 32.0 (iOS) or 24.0 (Android)
                    backgroundColor: Colors.white,
                  ),
                ),
              ),
            ),
        ],
      ),
      ),
    );
  }
}

class Message {
  final String text;
  final bool isUser;

  Message({required this.text, required this.isUser});
}
