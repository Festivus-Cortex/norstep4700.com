/**
 * GlitchIntensityAnimator - Audio-reactive glitch effect controller.
 *
 * Controls GlitchFx speed and activation based on audio levels (typically treble).
 * Triggers digital disruption effects during high-frequency peaks (hi-hats, cymbals).
 */

import { EffectFactory } from "../../core/EffectFactory";
import { EffectRegistry } from "../../core/EffectRegistry";
import {
  AudioFrameData,
  EffectInstance,
  EffectIntensity,
} from "../../core/types";
import { smoothDamp, clamp } from "@/utils/math";
import {
  GlitchIntensityAnimatorParams,
  GlitchIntensityAnimatorOutput,
  GlitchSpeed,
} from "./types";
import { getEffectConfigSync } from "../../config/loader";

/**
 * Internal effect instance for GlitchIntensityAnimator.
 */
class GlitchIntensityAnimatorEffectInstance
  implements EffectInstance<GlitchIntensityAnimatorParams, GlitchIntensityAnimatorOutput>
{
  readonly factoryType = "glitchIntensityAnimator";

  private params: GlitchIntensityAnimatorParams;
  private currentOutput: GlitchIntensityAnimatorOutput;
  private smoothedValue: number = 0;
  private intensityMultipliers: Record<EffectIntensity, number>;
  private normalization: { rmsMultiplier: number; frequencyDivisor: number };
  private holdTimer: number = 0;
  private lastPeakTime: number = 0;

  constructor(
    readonly id: string,
    params: GlitchIntensityAnimatorParams,
    intensityMultipliers: Record<EffectIntensity, number>
  ) {
    this.params = params;
    this.intensityMultipliers = intensityMultipliers;
    this.currentOutput = {
      speed: "slow",
      shouldGlitch: false,
      rawIntensity: 0,
    };

    // Load normalization config
    const config = getEffectConfigSync();
    this.normalization = config.audioAnalysis.normalization;
  }

  start(): void {
    this.smoothedValue = 0;
    this.holdTimer = 0;
    this.lastPeakTime = 0;
  }

  update(
    audioData: AudioFrameData,
    deltaTime: number
  ): GlitchIntensityAnimatorOutput {
    const {
      audioAnalysisSource,
      threshold,
      slowThreshold,
      mediumThreshold,
      smoothing,
      intensity,
      holdTime,
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
          "glitchIntensityAnimator has no way to analyze for given method of: " +
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

    // Apply intensity multiplier to thresholds (lower thresholds = more sensitive at higher intensity)
    const effectiveThreshold = threshold * (1 - (multiplier - 0.5));

    // Update hold timer
    const currentTime = audioData.timestamp;
    if (this.smoothedValue > effectiveThreshold) {
      this.lastPeakTime = currentTime;
    }
    const timeSincePeak = currentTime - this.lastPeakTime;

    // Determine if glitch should be active (above threshold or within hold time)
    const shouldGlitch =
      this.smoothedValue > effectiveThreshold || timeSincePeak < holdTime;

    // Determine speed based on intensity level
    let speed: GlitchSpeed;
    if (this.smoothedValue < slowThreshold) {
      speed = "slow";
    } else if (this.smoothedValue < mediumThreshold) {
      speed = "medium";
    } else {
      speed = "fast";
    }

    this.currentOutput = {
      speed,
      shouldGlitch,
      rawIntensity: this.smoothedValue,
    };

    return this.currentOutput;
  }

  end(): void {
    // No cleanup needed
  }

  setParams(params: Partial<GlitchIntensityAnimatorParams>): void {
    this.params = { ...this.params, ...params };
  }

  getParams(): GlitchIntensityAnimatorParams {
    return { ...this.params };
  }

  getCurrentOutput(): GlitchIntensityAnimatorOutput {
    return { ...this.currentOutput };
  }
}

/**
 * Factory for creating GlitchIntensityAnimator effect instances.
 */
export class GlitchIntensityAnimatorFactory extends EffectFactory<
  GlitchIntensityAnimatorParams,
  GlitchIntensityAnimatorOutput
> {
  readonly type = "glitchIntensityAnimator";
  readonly description = "Controls glitch effect intensity based on audio levels";

  protected createInstance(
    id: string,
    params: GlitchIntensityAnimatorParams
  ): EffectInstance<GlitchIntensityAnimatorParams, GlitchIntensityAnimatorOutput> {
    return new GlitchIntensityAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}

// Self-register the factory
EffectRegistry.register(new GlitchIntensityAnimatorFactory());
