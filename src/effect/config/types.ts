/**
 * Effect System Configuration Types
 *
 * Defines the structure for the centralized effect configuration system.
 * Config is loaded from /public/effect/config.json via API endpoint.
 */

import { BaseEffectParams, EffectIntensity } from "../core/types";
import {
  MaskRadiusAnimatorParams,
  GradientTiltAnimatorParams,
  DotsOpacityAnimatorParams,
  GradientScaleAnimatorParams,
  GlitchIntensityAnimatorParams,
  GradientPositionAnimatorParams,
} from "../animators";

/**
 * Audio analysis configuration
 */
export interface AudioAnalysisConfig {
  /** FFT configuration */
  fft: {
    /** FFT size (power of 2, typically 512-2048) */
    fftSize: number;
    /** Number of frequency bins (typically fftSize / 2) */
    frequencyBinCount: number;
  };
  /** Frequency band ranges for audio analysis */
  frequencyBands: {
    /** Bass frequencies (sub-bass to bass) */
    bass: { start: number; end: number };
    /** Low-mid frequencies */
    midLow: { start: number; end: number };
    /** High-mid frequencies */
    midHigh: { start: number; end: number };
    /** Treble frequencies */
    treble: { start: number; end: number };
  };
  /** Audio data normalization constants */
  normalization: {
    /** RMS multiplier for amplitude scaling */
    rmsMultiplier: number;
    /** Frequency data divisor (typically 255 for byte data) */
    frequencyDivisor: number;
  };
}

/**
 * Effect-specific configuration with defaults, intensity overrides, and variants
 */
export interface EffectTypeConfig<
  TParams extends BaseEffectParams = BaseEffectParams
> {
  /** Base default parameters for this effect type */
  defaults: Omit<TParams, "enabled" | "intensityMultipliers" | "trackId">;
  /** Partial parameter overrides per intensity level */
  intensityOverrides?: Partial<
    Record<
      EffectIntensity,
      Partial<
        Omit<
          TParams,
          "intensity" | "enabled" | "intensityMultipliers" | "trackId"
        >
      >
    >
  >;
  /** Named preset configurations for common use cases */
  variants?: Record<
    string,
    Partial<Omit<TParams, "enabled" | "intensityMultipliers" | "trackId">>
  >;
}

/**
 * All effect type configurations
 *
 * TODO: It would be nice to find a way to not have to manually add animators to
 * this type every time. Investigate alternatives.
 */
export interface EffectsConfig {
  /** MaskRadiusAnimator configuration */
  maskRadiusAnimator: EffectTypeConfig<MaskRadiusAnimatorParams>;
  /** GradientTiltAnimator configuration */
  gradientTiltAnimator: EffectTypeConfig<GradientTiltAnimatorParams>;
  /** DotsOpacityAnimator configuration */
  dotsOpacityAnimator: EffectTypeConfig<DotsOpacityAnimatorParams>;
  /** GradientScaleAnimator configuration */
  gradientScaleAnimator: EffectTypeConfig<GradientScaleAnimatorParams>;
  /** GlitchIntensityAnimator configuration */
  glitchIntensityAnimator: EffectTypeConfig<GlitchIntensityAnimatorParams>;
  /** GradientPositionAnimator configuration */
  gradientPositionAnimator: EffectTypeConfig<GradientPositionAnimatorParams>;
}

/**
 * Root effect system configuration
 */
export interface EffectSystemConfig {
  /** Audio analysis configuration */
  audioAnalysis: AudioAnalysisConfig;
  /** Global intensity multipliers */
  intensityMultipliers: Record<EffectIntensity, number>;
  /** Per-effect-type configurations */
  effects: EffectsConfig;
}
