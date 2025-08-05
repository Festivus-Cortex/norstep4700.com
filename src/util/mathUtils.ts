// FIXME: Verify functionality and comment better.

// Map a value from one range to another
const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
};
