import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Timer = ({ socket, setCountdown, countdown }) => {
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    if (socket) {
      // Define the function to handle incoming timer updates
      const handleTimerUpdate = (timerState) => {
        const { countdown, isRunning } = timerState;

        // Update the timer display based on the server state
        setCountdown(countdown);

        setEditable(!isRunning);
      };

      // Register the event listener for 'timer update' events
      socket.on("timer update", handleTimerUpdate);

      // Cleanup function to remove the event listener
      return () => {
        socket.off("timer update", handleTimerUpdate);
      };
    }
  }, [socket, setCountdown]);

  useEffect(() => {
    // Dynamically update the document title with the timer state
    document.title = `${countdown.minutes}:${countdown.seconds
      .toString()
      .padStart(2, "0")} | Focus`;
  }, [countdown]);

  // Handle manual changes to the timer (for when the timer is not running)
  const handleChange = (e, type) => {
    if (!editable) return;

    const value = Math.max(0, parseInt(e.target.value, 10) || 0);
    const updatedCountdown = { ...countdown, [type]: value };
    setCountdown(updatedCountdown);

    // Emit a 'sync timer' event for manual adjustments, reflecting changes across all clients
    socket.emit("sync timer", {
      countdown: updatedCountdown,
      isRunning: false,
    });
  };

  const isUnderOneMinute = countdown.minutes === 0 && countdown.seconds < 60;
  const timerClassName = `text-center my-4 text-9xl font-black ${
    isUnderOneMinute ? "animate-pulse" : ""
  }`;

  return (
    <>
      {editable ? (
        <div className={timerClassName}>
          <input
            type="number"
            value={countdown.minutes.toString().padStart(2, "0")}
            onChange={(e) => handleChange(e, "minutes")}
            className="timer-input"
            style={{ background: "#ff7200", width: "200px" }}
          />
          :
          <input
            type="number"
            value={countdown.seconds.toString().padStart(2, "0")}
            onChange={(e) => handleChange(e, "seconds")}
            className="timer-input"
            style={{ background: "#ff7200", width: "200px" }}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={timerClassName}
        >
          {`${countdown.minutes.toString().padStart(2, "0")}:${countdown.seconds
            .toString()
            .padStart(2, "0")}`}
        </motion.div>
      )}
    </>
  );
};

export default Timer;
