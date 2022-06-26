const isValidValue = (char: string) => {
  if (char === " " || char === "/") {
    return true;
  }

  const parsed = char.replace(/\D/g, "");
  if (!parsed) return false;

  return true;
};

export default isValidValue;
