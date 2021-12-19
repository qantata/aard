export const formatDigitalTime = (seconds: number) => {
  let result = "";

  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  seconds = Math.floor(seconds - minutes * 60 - hours * 60 * 60);

  if (hours > 0) {
    result += `${hours}`.padStart(2, "0");
    result += ":";
  }

  result += `${minutes}`.padStart(2, "0");
  result += ":";

  result += `${seconds}`.padStart(2, "0");
  return result;
};
