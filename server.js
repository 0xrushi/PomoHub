
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: "*", // The origin of your client app
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Use cors middleware
app.use(cors());
// Serve static files from the current directory
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const messages = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send the chat history to the new user
  socket.emit('chat history', messages);

  socket.on('new message', (data) => {
    messages.push(data);
    io.emit('new message', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
