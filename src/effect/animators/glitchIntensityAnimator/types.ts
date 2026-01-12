import {
  AudioAnalysisSource,
  BaseEffectParams,
  EffectOutput,
} from "../../core/types";

/**
 * Glitch speed variants matching GlitchFx component.
 */
export type GlitchSpeed = "slow" | "medium" | "fast";

/**
 * Parameters for the GlitchIntensityAnimator effect.
 */
export interface GlitchIntensityAnimatorParams extends BaseEffectParams {
  /** Which audio metric drives the effect */
  audioAnalysisSource: AudioAnalysisSource;
  /** Threshold to trigger glitch (0-1, audio level must exceed this) */
  threshold: number;
  /** Below this intensity = slow glitch (0-1) */
  slowThreshold: number;
  /** Below this intensity = medium, above = fast (0-1) */
  mediumThreshold: number;
  /** Smoothing factor (0 = instant, higher = smoother, 0-0.99) */
  smoothing: number;
  /** How long glitch persists after peak in ms */
  holdTime: number;
}

/**
 * Output from the GlitchIntensityAnimator effect.
 */
export interface GlitchIntensityAnimatorOutput extends EffectOutput {
  /** Glitch speed variant for GlitchFx component */
  speed: GlitchSpeed;
  /** Whether glitch should currently be active */
  shouldGlitch: boolean;
  /** Raw intensity value (0-1) for custom use */
  rawIntensity: number;
}
