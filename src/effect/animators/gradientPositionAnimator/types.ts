import {
  AudioAnalysisSource,
  BaseEffectParams,
  EffectOutput,
} from "../../core/types";

/**
 * Movement style for gradient position animation.
 */
export type MovementStyle = "random" | "radial" | "bounce";

/**
 * Parameters for the GradientPositionAnimator effect.
 */
export interface GradientPositionAnimatorParams extends BaseEffectParams {
  /** Which audio metric drives the effect (used for peak detection) */
  audioAnalysisSource: AudioAnalysisSource;
  /** Base X position (0-100 %) */
  baseX: number;
  /** Base Y position (0-100 %) */
  baseY: number;
  /** Maximum deviation from base position in % */
  maxDeviation: number;
  /** Smoothing factor for position return (0 = instant, higher = smoother) */
  smoothing: number;
  /** Audio level delta to detect a peak (0-1) */
  peakThreshold: number;
  /** How fast peak influence decays (0-1, higher = faster return to base) */
  peakDecay: number;
  /** How position changes on peaks */
  movementStyle: MovementStyle;
}

/**
 * Output from the GradientPositionAnimator effect.
 */
export interface GradientPositionAnimatorOutput extends EffectOutput {
  /** Current X position (0-100) */
  x: number;
  /** Current Y position (0-100) */
  y: number;
  /** CSS-formatted X position (e.g., "55%") */
  cssX: string;
  /** CSS-formatted Y position (e.g., "48%") */
  cssY: string;
}
