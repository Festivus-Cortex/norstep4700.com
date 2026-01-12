import {
  AudioAnalysisSource,
  BaseEffectParams,
  EffectOutput,
} from "../../core/types";

/**
 * Parameters for the GradientScaleAnimator effect.
 */
export interface GradientScaleAnimatorParams extends BaseEffectParams {
  /** Which audio metric drives the effect */
  audioAnalysisSource: AudioAnalysisSource;
  /** Base width value in % */
  baseWidth: number;
  /** Base height value in % */
  baseHeight: number;
  /** Minimum scale multiplier (e.g., 0.5 = half size) */
  minScale: number;
  /** Maximum scale multiplier (e.g., 2.0 = double size) */
  maxScale: number;
  /** Smoothing factor (0 = instant, higher = smoother, 0-0.99) */
  smoothing: number;
  /** Lock aspect ratio - width and height scale together */
  aspectLock: boolean;
}

/**
 * Output from the GradientScaleAnimator effect.
 */
export interface GradientScaleAnimatorOutput extends EffectOutput {
  /** Current width value (numeric %) */
  width: number;
  /** Current height value (numeric %) */
  height: number;
  /** CSS-formatted width string (e.g., "25%") */
  cssWidth: string;
  /** CSS-formatted height string (e.g., "25%") */
  cssHeight: string;
}
