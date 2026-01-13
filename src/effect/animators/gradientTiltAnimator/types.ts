import {
  AudioAnalysisSource,
  BaseEffectParams,
  EffectOutput,
} from "../../core/types";

/**
 * Parameters for the GradientTiltAnimator effect.
 */
export interface GradientTiltAnimatorParams extends BaseEffectParams {
  /** Which audio metric drives the effect */
  audioAnalysisSource: AudioAnalysisSource;
  /** Base tilt angle in degrees (center of effect range) */
  baseTilt: number;
  /** Minimum tilt angle in degrees */
  minTilt: number;
  /** Maximum tilt angle in degrees */
  maxTilt: number;
  /** Smoothing factor (0 = instant, higher = smoother, 0-0.99) */
  smoothing: number;
  /** Whether to oscillate around base (true) or map linearly from min to max (false) */
  oscillate: boolean;
}

/**
 * Output from the GradientTiltAnimator effect.
 */
export interface GradientTiltAnimatorOutput extends EffectOutput {
  /** Current tilt value in degrees (numeric) */
  tilt: number;
  /** CSS-formatted tilt string (e.g., "45deg") */
  cssTilt: string;
}
