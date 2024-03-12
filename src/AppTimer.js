import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Timer from "./components/timer/Timer.js";
import TimerButton from "./components/timer/TimerButton";
import TimerSelector from "./components/timer/TimerSelector";
import Tasks from "./components/tasks/Tasks";
import Footer from "./components/Footer";
import { io } from "socket.io-client";

function AppTimer({ backgroundColor, toggleGridState }) {
  const [countdown, setCountdown] = useState({
    minutes: 30,
    seconds: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  // State to switch color of timer selector bg
  const [currentTimer, setCurrentTimer] = useState("Pomodoro");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });
    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
    });

    // Listen for updates from the server to sync timer
    newSocket.on("sync timer", (timerState) => {
      setCountdown(timerState.countdown);
      setIsRunning(timerState.isRunning);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  let interval;

  function handlePause() {
    clearInterval(interval);
    setIsRunning(false);
    socket.emit("stop timer");
  }

  // Handle manual changes to the timer (for when the timer is not running)
  function handleCountdown() {
    setIsRunning(true); // Update the local state to reflect that the timer is running
    // Emit the 'start timer' event to the server with the current countdown state and isRunning set to true
    socket.emit("start timer", { countdown, isRunning: true });
  }

  function handleReset() {
    // Reset the timer to 30 minutes, but not running
    const resetState = { minutes: 30, seconds: 0 };
    setCountdown(resetState);
    setIsRunning(false);
    // Emit a 'reset timer' event to the server, including the new state
    socket.emit("reset timer", { countdown: resetState, isRunning: false });
  }

  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;
  }, [backgroundColor]);

  return (
    <Box style={{ position: "fixed" }}>
      <main className="font-atkinson flex min-h-screen min-w-full flex-col items-center justify-center text-white-500">
        <div className="mt-16 flex items-center justify-center rounded-md bg-gray-100">
          <TimerSelector
            timerType={"Pomodoro"}
            time={{
              minutes: 30,
              seconds: 0,
            }}
            setCountdown={setCountdown}
            currentTimer={currentTimer}
            setCurrentTimer={setCurrentTimer}
          />
          <TimerSelector
            timerType={"Break"}
            time={{
              minutes: 5,
              seconds: 0,
            }}
            setCountdown={setCountdown}
            currentTimer={currentTimer}
            setCurrentTimer={setCurrentTimer}
          />
        </div>

        <Timer
          countdown={countdown}
          setCountdown={setCountdown}
          isRunning={isRunning}
          interval={interval}
          socket={socket}
          backgroundColor={backgroundColor}
        />

        <div
          className="flex items-center justify-center sm:mt-8 rounded-md bg-gray-100"
          style={{ height: "20%" }}
        >
          {isRunning ? (
            <TimerButton
              action={handlePause}
              text={"pause"}
              bgcolor={"white"}
              textcolor={"text-gray-800"}
              border={"rounded-l-md"}
              label="Pause timer"
            />
          ) : (
            <TimerButton
              action={handleCountdown}
              text={"play"}
              bgcolor={"bg-gray-800"}
              textcolor={"text-gray-100"}
              // border={'rounded-l-md'}
              label="Play timer"
            />
          )}

          <TimerButton
            action={handleReset}
            text={"reset"}
            bgcolor={"white"}
            // border={'rounded-r-md'}
            label="Reset timer"
          />
        </div>
        {toggleGridState && (
          <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
            <Tasks />
          </div>
        )}
        <Footer />
      </main>
    </Box>
  );
}

export default AppTimer;
