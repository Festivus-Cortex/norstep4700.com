import {
  AudioAnalysisSource,
  BaseEffectParams,
  EffectOutput,
} from "../../core/types";

/**
 * Parameters for the DotsOpacityAnimator effect.
 */
export interface DotsOpacityAnimatorParams extends BaseEffectParams {
  /** Which audio metric drives the effect */
  audioAnalysisSource: AudioAnalysisSource;
  /** Base opacity (0-100, center of effect range) */
  baseOpacity: number;
  /** Minimum opacity (0-100) */
  minOpacity: number;
  /** Maximum opacity (0-100) */
  maxOpacity: number;
  /** Smoothing factor (0 = instant, higher = smoother, 0-0.99) */
  smoothing: number;
}

/**
 * Output from the DotsOpacityAnimator effect.
 */
export interface DotsOpacityAnimatorOutput extends EffectOutput {
  /** Current opacity (0-100 for Flex opacity prop) */
  opacity: number;
  /** Normalized opacity (0-1 for CSS opacity property) */
  normalizedOpacity: number;
}
