/**
 * ElementOpacityAnimator - Audio-reactive element opacity effect.
 *
 * Fades element opacity in and out based on audio levels.
 * Can be applied to any visual element (dots, shapes, layers, etc.).
 * Creates a shimmer/sparkle effect that responds to harmonic content.
 */

import { EffectFactory } from "../../core/EffectFactory";
import { EffectRegistry } from "../../core/EffectRegistry";
import {
  AudioFrameData,
  EffectInstance,
  EffectIntensity,
} from "../../core/types";
import { smoothDamp, clamp } from "@/utils/math";
import { ElementOpacityAnimatorParams, ElementOpacityAnimatorOutput } from "./types";
import { getEffectConfigSync } from "../../config/loader";

/**
 * Internal effect instance for ElementOpacityAnimator.
 */
class ElementOpacityAnimatorEffectInstance implements EffectInstance<
  ElementOpacityAnimatorParams,
  ElementOpacityAnimatorOutput
> {
  readonly factoryType = "elementOpacityAnimator";

  private params: ElementOpacityAnimatorParams;
  private currentOutput: ElementOpacityAnimatorOutput;
  private smoothedValue: number = 0;
  private intensityMultipliers: Record<EffectIntensity, number>;
  private normalization: { rmsMultiplier: number; frequencyDivisor: number };

  constructor(
    readonly id: string,
    params: ElementOpacityAnimatorParams,
    intensityMultipliers: Record<EffectIntensity, number>
  ) {
    this.params = params;
    this.intensityMultipliers = intensityMultipliers;
    this.currentOutput = {
      opacity: params.baseOpacity,
      normalizedOpacity: params.baseOpacity / 100,
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
  ): ElementOpacityAnimatorOutput {
    const {
      audioAnalysisSource,
      baseOpacity,
      minOpacity,
      maxOpacity,
      smoothing,
      intensity,
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
          "elementOpacityAnimator has no way to analyze for given method of: " +
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
    const range = maxOpacity - minOpacity;
    const effectiveRange = range * multiplier;

    // Center the effective range around the base opacity
    const effectiveMin = Math.max(minOpacity, baseOpacity - effectiveRange / 2);
    const effectiveMax = Math.min(maxOpacity, baseOpacity + effectiveRange / 2);

    // Map smoothed value to opacity
    const opacity =
      effectiveMin + this.smoothedValue * (effectiveMax - effectiveMin);
    const clampedOpacity = clamp(opacity, minOpacity, maxOpacity);

    this.currentOutput = {
      opacity: clampedOpacity,
      normalizedOpacity: clampedOpacity / 100,
    };

    return this.currentOutput;
  }

  end(): void {
    // No cleanup needed
  }

  setParams(params: Partial<ElementOpacityAnimatorParams>): void {
    this.params = { ...this.params, ...params };
  }

  getParams(): ElementOpacityAnimatorParams {
    return { ...this.params };
  }

  getCurrentOutput(): ElementOpacityAnimatorOutput {
    return { ...this.currentOutput };
  }
}

/**
 * Factory for creating ElementOpacityAnimator effect instances.
 */
export class ElementOpacityAnimatorFactory extends EffectFactory<
  ElementOpacityAnimatorParams,
  ElementOpacityAnimatorOutput
> {
  readonly type = "elementOpacityAnimator";
  readonly description = "Animates element opacity based on audio levels";

  protected createInstance(
    id: string,
    params: ElementOpacityAnimatorParams
  ): EffectInstance<ElementOpacityAnimatorParams, ElementOpacityAnimatorOutput> {
    return new ElementOpacityAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}

// Self-register the factory
EffectRegistry.register(new ElementOpacityAnimatorFactory());
