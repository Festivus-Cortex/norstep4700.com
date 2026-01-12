/**
 * GradientTiltAnimator - Audio-reactive gradient rotation effect.
 *
 * Animates gradient tilt/rotation based on audio levels (typically RMS).
 * Creates a subtle swaying effect that follows the music's energy.
 */

import {
  AudioFrameData,
  EffectInstance,
  EffectIntensity,
} from "../../core/types";
import { smoothDamp, clamp } from "@/utils/math";
import {
  GradientTiltAnimatorParams,
  GradientTiltAnimatorOutput,
} from "./types";
import { getEffectConfigSync } from "../../config/loader";

/**
 * Internal effect instance for GradientTiltAnimator.
 * Exported for use by the factory.
 */
export class GradientTiltAnimatorEffectInstance implements EffectInstance<
  GradientTiltAnimatorParams,
  GradientTiltAnimatorOutput
> {
  readonly factoryType = "gradientTiltAnimator";

  private params: GradientTiltAnimatorParams;
  private currentOutput: GradientTiltAnimatorOutput;
  private smoothedValue: number = 0;
  private intensityMultipliers: Record<EffectIntensity, number>;
  private normalization: { rmsMultiplier: number; frequencyDivisor: number };

  constructor(
    readonly id: string,
    params: GradientTiltAnimatorParams,
    intensityMultipliers: Record<EffectIntensity, number>
  ) {
    this.params = params;
    this.intensityMultipliers = intensityMultipliers;
    this.currentOutput = {
      tilt: params.baseTilt,
      cssTilt: `${params.baseTilt}deg`,
    };

    // Load normalization config
    const config = getEffectConfigSync();
    this.normalization = config.audioAnalysis.normalization;
  }

  start(): void {
    // Initialize smoothed value to center
    this.smoothedValue = 0.5;
  }

  update(
    audioData: AudioFrameData,
    deltaTime: number
  ): GradientTiltAnimatorOutput {
    const {
      audioAnalysisSource,
      baseTilt,
      minTilt,
      maxTilt,
      smoothing,
      intensity,
      oscillate,
      intensityMultipliers: customMultipliers,
    } = this.params;

    // Get raw audio value and normalize to 0-1
    let rawValue: number;
    switch (audioAnalysisSource) {
      case "rms":
        rawValue = clamp(
          audioData.rms * this.normalization.rmsMultiplier,
          0,
          1
        );
        break;
      case "bass":
        rawValue = audioData.bass / this.normalization.frequencyDivisor;
        break;
      case "midLow":
        rawValue = audioData.midLow / this.normalization.frequencyDivisor;
        break;
      case "midHigh":
        rawValue = audioData.midHigh / this.normalization.frequencyDivisor;
        break;
      case "treble":
        rawValue = audioData.treble / this.normalization.frequencyDivisor;
        break;
      default:
        rawValue = 0;
        console.warn(
          "gradientTiltAnimator has no way to analyze for given method of: " +
            audioAnalysisSource
        );
    }

    // Apply smoothing (frame-rate independent)
    this.smoothedValue = smoothDamp(
      this.smoothedValue,
      rawValue,
      smoothing,
      deltaTime
    );

    // Get effective intensity multiplier
    const multipliers = { ...this.intensityMultipliers, ...customMultipliers };
    const multiplier = multipliers[intensity];

    // Calculate effective range based on intensity
    const range = maxTilt - minTilt;
    const effectiveRange = range * multiplier;

    let tilt: number;
    if (oscillate) {
      // Oscillate around base tilt
      const effectiveMin = Math.max(minTilt, baseTilt - effectiveRange / 2);
      const effectiveMax = Math.min(maxTilt, baseTilt + effectiveRange / 2);
      tilt = effectiveMin + this.smoothedValue * (effectiveMax - effectiveMin);
    } else {
      // Linear mapping from min to max
      tilt = minTilt + this.smoothedValue * effectiveRange;
    }

    const clampedTilt = clamp(tilt, minTilt, maxTilt);

    this.currentOutput = {
      tilt: clampedTilt,
      cssTilt: `${clampedTilt}deg`,
    };

    return this.currentOutput;
  }

  end(): void {
    // No cleanup needed
  }

  setParams(params: Partial<GradientTiltAnimatorParams>): void {
    this.params = { ...this.params, ...params };
  }

  getParams(): GradientTiltAnimatorParams {
    return { ...this.params };
  }

  getCurrentOutput(): GradientTiltAnimatorOutput {
    return { ...this.currentOutput };
  }
}
