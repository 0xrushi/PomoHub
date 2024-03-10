const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

let timerState = {
  countdown: { minutes: 25, seconds: 0 },
  isRunning: false,
};

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://0.0.0.0:3001",
    methods: ["GET", "POST"],
  },
});
let chatHistory = [];

// Function to decrement the timer
function decrementTimer() {
  if (timerState.countdown.seconds > 0) {
    timerState.countdown.seconds -= 1;
  } else if (timerState.countdown.minutes > 0) {
    timerState.countdown.minutes -= 1;
    timerState.countdown.seconds = 59;
  } else {
    timerState.isRunning = false;
  }
}

// Broadcast timer state every second
setInterval(() => {
  if (timerState.isRunning) {
    decrementTimer();
    io.emit("timer update", timerState);
  }
}, 1000);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send the current timer state to newly connected clients
  socket.emit("timer update", timerState);

  // No need to emit here since the setInterval will handle broadcasting
  socket.on("start timer", (data) => {
    if (!timerState.isRunning) {
      timerState = { ...data, isRunning: true };
      console.log("Timer started", data);
    }
  });

  socket.on("stop timer", () => {
    if (timerState.isRunning) {
      timerState.isRunning = false;
      console.log("Timer stopped");

      // Broadcast stop immediately
      io.emit("timer update", timerState);
    }
  });

  // Update the timer state without starting or stopping
  socket.on("sync timer", (data) => {
    timerState = { ...data, isRunning: timerState.isRunning };
    console.log("Timer synchronized", timerState);
  });

  socket.on("reset timer", () => {
    timerState = {
      countdown: { minutes: 0, seconds: 0 },
      isRunning: false,
    };

    // Set the countdown to the desired reset state
    timerState.countdown = { minutes: 30, seconds: 0 };
    console.log("Timer reset to 30 minutes");

    // Broadcast the updated, reset timer state
    io.emit("timer update", timerState);
  });

  // Send existing chat history to the newly connected client
  socket.emit("chat history", chatHistory);

  socket.on("send message", (message) => {
    // Add the new message to the chat history
    chatHistory.push(message);

    // Broadcast the new message to all clients
    io.emit("new message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server listening on *:3000");
});
