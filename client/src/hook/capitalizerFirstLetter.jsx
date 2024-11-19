const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  if (string.includes("@")) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default capitalizeFirstLetter;
