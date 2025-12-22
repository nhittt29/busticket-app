abstract class NotificationEvent {}
class LoadNotificationsEvent extends NotificationEvent {
  final int? userId;
  LoadNotificationsEvent({this.userId});
}
class MarkAllAsReadEvent extends NotificationEvent {}