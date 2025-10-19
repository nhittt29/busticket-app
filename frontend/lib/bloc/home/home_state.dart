import 'package:equatable/equatable.dart';

class HomeState extends Equatable {
  final bool loading;
  final Map<String, dynamic>? user;
  final String? error;

  const HomeState({
    this.loading = false,
    this.user,
    this.error,
  });

  HomeState copyWith({
    bool? loading,
    Map<String, dynamic>? user,
    String? error,
  }) {
    return HomeState(
      loading: loading ?? this.loading,
      user: user ?? this.user,
      error: error,
    );
  }

  @override
  List<Object?> get props => [loading, user, error];
}
