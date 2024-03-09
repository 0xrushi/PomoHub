import { useState } from "react";
import { Box } from "@mui/material";
import Timer from "./components/timer/Timer.js";
import TimerButton from "./components/timer/TimerButton";
import TimerSelector from "./components/timer/TimerSelector";
import Tasks from "./components/tasks/Tasks";
import Footer from "./components/Footer";

function AppTimer() {
  const [countdown, setCountdown] = useState({
    minutes: 30,
    seconds: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  // State to switch color of timer selector bg
  const [currentTimer, setCurrentTimer] = useState("Pomodoro");

  let interval;

  //   Play, pause and reset functions
  function handleCountdown() {
    setIsRunning(true);
  }

  // clearInterval() method cancels a timed, repeating action which was previously established by a call to setInterval()

  function handleReset() {
    clearInterval(interval);
    setIsRunning(false);

    let resetTime = {
      minutes: 0,
      seconds: 0,
    };

    // Determine the appropriate reset time based on the current timer type
    if (currentTimer === "Pomodoro") {
      resetTime = {
        minutes: 30,
        seconds: 0,
      };
    } else if (currentTimer === "Short break") {
      resetTime = {
        minutes: 5,
        seconds: 0,
      };
    } else if (currentTimer === "Long break") {
      resetTime = {
        minutes: 10,
        seconds: 0,
      };
    }

    setCountdown(resetTime);
  }

  function handlePause() {
    clearInterval(interval);
    setIsRunning(false);
  }

  return (
    <Box style={{ position: "fixed" }}>
      <main className="font-atkinson flex min-h-screen min-w-full flex-col items-center justify-center bg-[#FF7200] text-white-500">
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
        <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
          <Tasks />
        </div>
        <Footer />
      </main>
    </Box>
  );
}

export default AppTimer;
