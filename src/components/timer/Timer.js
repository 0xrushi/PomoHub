import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Timer({
  countdown,
  isRunning,
  interval,
  setCountdown,
}) {
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    if (isRunning) {
      setEditable(false); // Lock editing while the timer is running
      interval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown.seconds > 0) {
            return {
              ...prevCountdown,
              seconds: prevCountdown.seconds - 1,
            };
          } else if (prevCountdown.minutes > 0) {
            return {
              minutes: prevCountdown.minutes - 1,
              seconds: 59,
            };
          } else {
            // Countdown is complete
            clearInterval(interval);
            return prevCountdown;
          }
        });
      }, 1000);
    } else {
      clearInterval(interval);
      setEditable(true); // Allow editing when the timer is not running
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    document.title = `${countdown.minutes}:${countdown.seconds
      .toString()
      .padStart(2, "0")} | Focus`;
  }, [countdown]);

  const handleChange = (
    e,
    type
  ) => {
    const value = Math.max(0, parseInt(e.target.value, 10) || 0);
    setCountdown((prev) => ({
      ...prev,
      [type]: value,
    }));
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
            style={{ background: "#ff7200", width: "40%" }}
            value={countdown.minutes.toString().padStart(2, "0")}
            onChange={(e) => handleChange(e, "minutes")}
            className="w-20 text-center"
          />
          :
          <input
            type="number"
            style={{ background: "#ff7200", width: "40%" }}
            value={countdown.seconds.toString().padStart(2, "0")}
            onChange={(e) => handleChange(e, "seconds")}
            className="w-20 text-center"
          />
        </div>
      ) : (
        <motion.time
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={timerClassName}
        >
          {`${countdown.minutes.toString().padStart(2, "0")}:${countdown.seconds
            .toString()
            .padStart(2, "0")}`}
        </motion.time>
      )}
    </>
  );
}
