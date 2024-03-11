import React from "react";

export default function TimerButton({
  action,
  text,
  label,
  bgcolor,
  textcolor,
  border,
}) {
  return (
    <button
      onClick={action}
      // className='mt-16 flex items-center justify-center rounded-md bg-gray-100'
      className={`m-1 rounded-md ${bgcolor} ${textcolor} ${border} px-3 py-2 text-xl font-bold uppercase active:translate-y-0.5`}
      aria-label={label}
    >
      {text}
    </button>
  );
}
