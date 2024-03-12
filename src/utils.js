import chroma from "chroma-js";

function getFontColorForBackground(backgroundColor) {
  // Calculate the brightness of the background color
  const brightness = chroma(backgroundColor).luminance();
  return brightness < 0.5 ? "white" : "black";
}

export default getFontColorForBackground;
