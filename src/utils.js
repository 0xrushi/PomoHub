import chroma from "chroma-js";

function getFontColorForBackground(backgroundColor) {
  // Calculate the brightness of the background color
  const brightness = chroma(backgroundColor).luminance();
  return brightness < 0.5 ? "white" : "black";
}

const formatDate = (date) => {
  // Format the date as YYYY-MM-DD
  let day = date.getDate().toString().padStart(2, "0");
  let month = (date.getMonth() + 1).toString().padStart(2, "0"); // Note: months are 0-based
  let year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

const formatTime = (date) => {
  // Format the time as HHMMSS
  let hours = date.getHours().toString().padStart(2, "0");
  let minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export { getFontColorForBackground, formatDate, formatTime };
