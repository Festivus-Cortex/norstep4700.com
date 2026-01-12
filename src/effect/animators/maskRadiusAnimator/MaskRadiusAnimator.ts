/**
 * MaskRadiusAnimator - Audio-reactive mask radius effect.
 *
 * Animates a mask radius (like the spotlight effect in Background.tsx)
 * based on audio levels. Supports different audio sources and smoothing.
 */

import {
  AudioFrameData,
  EffectInstance,
  EffectIntensity,
} from "../../core/types";
import { smoothDamp, clamp } from "@/utils/math";
import { MaskRadiusAnimatorParams, MaskRadiusAnimatorOutput } from "./types";
import { getEffectConfigSync } from "../../config/loader";

/**
 * Internal effect instance for MaskRadiusAnimator.
 * Exported for use by the factory.
 */
export class MaskRadiusAnimatorEffectInstance implements EffectInstance<
  MaskRadiusAnimatorParams,
  MaskRadiusAnimatorOutput
> {
  readonly factoryType = "maskRadiusAnimator";

  private params: MaskRadiusAnimatorParams;
  private currentOutput: MaskRadiusAnimatorOutput;
  private smoothedValue: number = 0;
  private intensityMultipliers: Record<EffectIntensity, number>;
  private normalization: { rmsMultiplier: number; frequencyDivisor: number };

  constructor(
    readonly id: string,
    params: MaskRadiusAnimatorParams,
    intensityMultipliers: Record<EffectIntensity, number>
  ) {
    this.params = params;
    this.intensityMultipliers = intensityMultipliers;
    this.currentOutput = {
      radius: params.baseRadius,
      cssRadius: `${params.baseRadius}vh`,
    };

    // Load normalization config
    const config = getEffectConfigSync();
    this.normalization = config.audioAnalysis.normalization;
  }

  start(): void {
    // Initialize smoothed value to base
    this.smoothedValue = 0.5; // Normalized middle
  }

  update(
    audioData: AudioFrameData,
    deltaTime: number
  ): MaskRadiusAnimatorOutput {
    const {
      audioAnalysisSource,
      baseRadius,
      minRadius,
      maxRadius,
      smoothing,
      intensity,
      intensityMultipliers: customMultipliers,
    } = this.params;

    // Get raw audio value and normalize to 0-1 using config normalization
    let rawValue: number;
    switch (audioAnalysisSource) {
      case "rms":
        // RMS is already 0-1, but typically peaks around 0.3-0.5
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
          "maskRadiusAnimator has no way to analyze for give method of: " +
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
    const range = maxRadius - minRadius;
    const effectiveRange = range * multiplier;

    // Center the effective range around the base radius
    const effectiveMin = Math.max(minRadius, baseRadius - effectiveRange / 2);
    const effectiveMax = Math.min(maxRadius, baseRadius + effectiveRange / 2);

    // Map smoothed value to radius
    const radius =
      effectiveMin + this.smoothedValue * (effectiveMax - effectiveMin);
    const clampedRadius = clamp(radius, minRadius, maxRadius);

    this.currentOutput = {
      radius: clampedRadius,
      cssRadius: `${clampedRadius}vh`,
    };

    return this.currentOutput;
  }

  end(): void {
    // No cleanup needed
  }

  setParams(params: Partial<MaskRadiusAnimatorParams>): void {
    this.params = { ...this.params, ...params };
  }

  getParams(): MaskRadiusAnimatorParams {
    return { ...this.params };
  }

  getCurrentOutput(): MaskRadiusAnimatorOutput {
    return { ...this.currentOutput };
  }
}

