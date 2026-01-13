/**
 * Math utilities for value manipulation and interpolation.
 */

/**
 * Map a value from one range to another.
 * @param value - Input value
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Mapped value in output range
 */
const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
};

/**
 * Clamp a value between a minimum and maximum.
 * @param value - Value to clamp
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Clamped value
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation between two values.
 * @param current - Current value
 * @param target - Target value
 * @param factor - Interpolation factor (0-1)
 * @returns Interpolated value
 */
const lerp = (current: number, target: number, factor: number): number => {
  return current + (target - current) * factor;
};

/**
 * Normalize a value from a range to 0-1.
 * @param value - Value to normalize
 * @param min - Range minimum
 * @param max - Range maximum
 * @returns Normalized value (0-1)
 */
const normalize = (value: number, min: number, max: number): number => {
  return (value - min) / (max - min);
};

/**
 * Frame-rate independent smoothing using exponential decay.
 * Use this for smooth animations that behave consistently regardless of frame rate.
 * @param current - Current value
 * @param target - Target value
 * @param smoothing - Smoothing factor (0 = instant, 1 = never reaches target)
 * @param deltaTime - Time since last frame in milliseconds
 * @returns Smoothed value
 */
const smoothDamp = (
  current: number,
  target: number,
  smoothing: number,
  deltaTime: number
): number => {
  // Convert smoothing to a time-based decay factor
  // At 60fps (16.67ms), this behaves similarly to simple lerp
  const factor = 1 - Math.pow(smoothing, deltaTime / 16.67);
  return lerp(current, target, factor);
};

export { mapRange, clamp, lerp, normalize, smoothDamp };
