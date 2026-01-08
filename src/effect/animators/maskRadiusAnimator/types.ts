import {
  AudioAnalysisSource,
  BaseEffectParams,
  EffectOutput,
} from "../../core/types";

/**
 * Parameters for the MaskRadiusAnimator effect.
 */
export interface MaskRadiusAnimatorParams extends BaseEffectParams {
  /** Which audio metric drives the effect */
  audioAnalysisSource: AudioAnalysisSource;
  /** Base radius value (center of effect range) in vh */
  baseRadius: number;
  /** Minimum radius in vh */
  minRadius: number;
  /** Maximum radius in vh */
  maxRadius: number;
  /** Smoothing factor (0 = instant, higher = smoother, 0-0.99) */
  smoothing: number;
}

/**
 * Output from the MaskRadiusAnimator effect.
 */
export interface MaskRadiusAnimatorOutput extends EffectOutput {
  /** Current radius value (numeric) */
  radius: number;
  /** CSS-formatted radius string (e.g., "50vh") */
  cssRadius: string;
}
