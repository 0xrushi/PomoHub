export default function TimerSelector({
  timerType,
  setCountdown,
  time,
  currentTimer,
  setCurrentTimer,
}) {
  function handleTimerSelector() {
    setCountdown({ ...time });
    setCurrentTimer(timerType);
  }

  return (
    <button
      onClick={handleTimerSelector}
      className={`text-md mx-1 my-1 rounded-md px-3 py-1 font-bold capitalize ${
        currentTimer === timerType
          ? "bg-gradient-to-br from-slate-700 to-sky-950 text-white"
          : "text-gray-800"
      } from-slate-700 to-sky-950 hover:bg-gradient-to-br hover:text-white focus:text-white active:translate-y-0.5`}
    >
      {timerType}
    </button>
  );
}
