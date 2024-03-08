import { useEffect } from 'react';
import { motion } from 'framer-motion';


export default function Timer({
  countdown,
  isRunning,
  interval,
  setCountdown,
}) {
  useEffect(() => {
    if (isRunning) {
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
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // Shows the timer in the tab of the browser
  useEffect(() => {
    document.title = `${countdown.minutes}:${countdown.seconds
      .toString()
      .padStart(2, '0')} | Focus`;
  }, [countdown]);

  const isUnderOneMinute = countdown.minutes === 0 && countdown.seconds < 60;
  const timerClassName = `text-center my-4 text-9xl font-black ${
    isUnderOneMinute ? 'animate-pulse' : ''
  }`;

  return (
    <>
      <motion.time
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={timerClassName}
      >
        {`${countdown.minutes}:${countdown.seconds
          .toString()
          .padStart(2, '0')}`}
      </motion.time>
    </>
  );
}
