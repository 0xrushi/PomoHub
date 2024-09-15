import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'dart:async';
import 'package:flutter/services.dart';
// import 'package:audioplayers/audioplayers.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pomodoro Timer',
      theme: ThemeData(
        primaryColor: Color(0xFFE67E22),
        scaffoldBackgroundColor: Color(0xFFE67E22),
        appBarTheme: AppBarTheme(
          backgroundColor: Color(0xFFE67E22),
          foregroundColor: Colors.white,
        ),
        colorScheme: ColorScheme.fromSwatch(
          primarySwatch: MaterialColor(0xFFE67E22, {
            50: Color(0xFFFDEDED),
            100: Color(0xFFFBD2D2),
            200: Color(0xFFF9B7B7),
            300: Color(0xFFF79B9B),
            400: Color(0xFFF58080),
            500: Color(0xFFE67E22),
            600: Color(0xFFD35400),
            700: Color(0xFFB74E00),
            800: Color(0xFF9A4200),
            900: Color(0xFF7D3600),
          }),
          accentColor: Color(0xFFD35400),
        ),
        textTheme: TextTheme(
          bodyMedium: TextStyle(color: Colors.white),
          bodyLarge: TextStyle(color: Colors.white),
          titleLarge: TextStyle(color: Colors.white),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            foregroundColor: Colors.white,
            backgroundColor: Color(0xFFD35400),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: BorderSide(color: Color(0xFFD35400)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: BorderSide(color: Color(0xFFD35400), width: 2),
          ),
        ),
      ),
      home: PomodoroTimer(),
    );
  }
}

class PomodoroTimer extends StatefulWidget {
  @override
  _PomodoroTimerState createState() => _PomodoroTimerState();
}

class _PomodoroTimerState extends State<PomodoroTimer>
    with SingleTickerProviderStateMixin {
  IO.Socket? socket;
  int minutes = 25;
  int seconds = 0;
  bool isRunning = false;
  List<String> connectedUsers = [];
  TextEditingController usernameController = TextEditingController();
  TextEditingController timerController = TextEditingController();
  String? currentUser;
  List<String> chatMessages = [];
  TextEditingController messageController = TextEditingController();
  bool isChatMode = false;
  late AnimationController _animationController;
  late Animation<double> _animation;
  // final AudioPlayer audioPlayer = AudioPlayer();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _animation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    timerController.text = '25:00';
    connectToServer();
    // loadRingtone();
  }

  // Future<void> loadRingtone() async {
  //   await audioPlayer.setSource(AssetSource('happy_bells.wav'));
  // }

  void connectToServer() {
    socket = IO.io('https://api.pomohub.xyz', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    socket!.connect();

    socket!.on('connect', (_) {
      print('Connected to server');
    });

    socket!.on('timer update', (data) {
      setState(() {
        minutes = data['countdown']['minutes'];
        seconds = data['countdown']['seconds'];
        isRunning = data['isRunning'];
        timerController.text =
            '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
      });

      if (minutes == 0 && seconds == 0) {
        // playRingtone();
      }
    });

    socket!.on('update user list', (users) {
      setState(() {
        connectedUsers = List<String>.from(users.map((user) => user['name']));
      });
    });

    socket!.on('new message', (message) {
      if (message is Map<String, dynamic>) {
        setState(() {
          chatMessages.add('${message['name']}: ${message['message']}');
        });
      }
    });
  }

  // void playRingtone() async {
  //   await audioPlayer.play(AssetSource('happy_bells.wav'));
  // }

  void startTimer() {
    final parts = timerController.text.split(':');
    if (parts.length == 2) {
      minutes = int.tryParse(parts[0]) ?? 25;
      seconds = int.tryParse(parts[1]) ?? 0;
    }
    socket!.emit('start timer', {
      'countdown': {'minutes': minutes, 'seconds': seconds}
    });
  }

  void stopTimer() {
    socket!.emit('stop timer');
  }

  void resetTimer() {
    socket!.emit('reset timer');
    // audioPlayer.stop();
    setState(() {
      timerController.text = '25:00';
    });
  }

  void submitUsername() {
    if (usernameController.text.isNotEmpty) {
      setState(() {
        currentUser = usernameController.text;
      });
      socket!.emit('submit username', usernameController.text);
      Navigator.of(context).pop();
      _animationController.forward();
    }
  }

  void sendMessage() {
    if (messageController.text.isNotEmpty && currentUser != null) {
      final message = {
        'name': currentUser,
        'message': messageController.text.trim(),
      };
      socket!.emit('send message', message);
      messageController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('PomoHub App', style: TextStyle(color: Colors.white)),
        elevation: 0,
        actions: [
          if (currentUser != null)
            IconButton(
              icon: Icon(isChatMode ? Icons.timer : Icons.chat,
                  color: Colors.white),
              onPressed: () {
                setState(() {
                  isChatMode = !isChatMode;
                });
              },
            ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Theme.of(context).primaryColor,
              Theme.of(context).colorScheme.secondary
            ],
          ),
        ),
        child: currentUser == null
            ? Center(
                child: ElevatedButton(
                  child: Text('Enter Username'),
                  onPressed: () => _showUsernameDialog(),
                ),
              )
            : Row(
                children: [
                  Expanded(
                    child: FadeTransition(
                      opacity: _animation,
                      child: isChatMode ? _buildChatView() : _buildTimerView(),
                    ),
                  ),
                ],
              ),
      ),
      bottomNavigationBar: currentUser != null
          ? Container(
              height: 80,
              decoration: BoxDecoration(
                color: Color(0xFFD35400),
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Center(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: connectedUsers
                        .map((user) => _buildUserIcon(user))
                        .toList(),
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildUserIcon(String name) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4),
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Text(
          name[0].toUpperCase(),
          style: TextStyle(
              color: Theme.of(context).primaryColor,
              fontWeight: FontWeight.bold,
              fontSize: 20),
        ),
      ),
    );
  }

  Widget _buildTimerView() {
    return Center(
      child: Container(
        padding: EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            TextField(
              controller: timerController,
              style: TextStyle(
                fontSize: 60,
                fontWeight: FontWeight.bold,
                color: Color(0xFFD35400),
              ),
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[0-9:]')),
              ],
              decoration: InputDecoration(
                border: InputBorder.none,
                contentPadding: EdgeInsets.zero,
              ),
            ),
            SizedBox(height: 20),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                ElevatedButton(
                  onPressed: isRunning ? stopTimer : startTimer,
                  child: Text(isRunning ? 'Stop' : 'Start'),
                ),
                SizedBox(width: 20),
                ElevatedButton(
                  onPressed: resetTimer,
                  child: Text('Reset'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatView() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(20),
      ),
      margin: EdgeInsets.all(16),
      child: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: chatMessages.length,
              itemBuilder: (context, index) {
                return Container(
                  padding: EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                  margin: EdgeInsets.symmetric(vertical: 4),
                  decoration: BoxDecoration(
                    color: Color(0xFFE67E22).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Text(
                    chatMessages[index],
                    style: TextStyle(color: Colors.black87),
                  ),
                );
              },
            ),
          ),
          SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: messageController,
                  decoration: InputDecoration(
                    hintText: 'Type a message...',
                    filled: true,
                    fillColor: Colors.white,
                  ),
                ),
              ),
              SizedBox(width: 8),
              IconButton(
                icon: Icon(Icons.send, color: Color(0xFFD35400)),
                onPressed: sendMessage,
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showUsernameDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Enter Username',
              style: TextStyle(color: Color(0xFFD35400))),
          content: TextField(
            controller: usernameController,
            decoration: InputDecoration(hintText: "Username"),
            style: TextStyle(color: Colors.black),
          ),
          actions: <Widget>[
            TextButton(
              child: Text('Submit', style: TextStyle(color: Color(0xFFD35400))),
              onPressed: submitUsername,
            ),
          ],
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        );
      },
    );
  }

  @override
  void dispose() {
    socket?.disconnect();
    _animationController.dispose();
    // audioPlayer.dispose();
    timerController.dispose();
    super.dispose();
  }
}
