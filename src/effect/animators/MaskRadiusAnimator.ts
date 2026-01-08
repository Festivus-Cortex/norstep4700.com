/**
 * MaskRadiusAnimator - Audio-reactive mask radius effect.
 *
 * Animates a mask radius (like the spotlight effect in Background.tsx)
 * based on audio levels. Supports different audio sources and smoothing.
 */

import { EffectFactory } from "../core/EffectFactory";
import { EffectRegistry } from "../core/EffectRegistry";
import {
  AudioFrameData,
  AudioAnalysisSource,
  BaseEffectParams,
  EffectInstance,
  EffectIntensity,
  EffectOutput,
} from "../core/types";
import { smoothDamp, clamp } from "@/utils/math";

/**
 * Parameters for the MaskRadiusAnimator effect.
 */
export interface MaskRadiusAnimatorParams extends BaseEffectParams {
  /** Which audio metric drives the effect */
  audioSource: AudioAnalysisSource;
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

/**
 * Internal effect instance for MaskRadiusAnimator.
 */
class MaskRadiusAnimatorEffectInstance
  implements EffectInstance<MaskRadiusAnimatorParams, MaskRadiusAnimatorOutput>
{
  readonly factoryType = "maskRadiusAnimator";

  private params: MaskRadiusAnimatorParams;
  private currentOutput: MaskRadiusAnimatorOutput;
  private smoothedValue: number = 0;
  private intensityMultipliers: Record<EffectIntensity, number>;

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
      audioSource,
      baseRadius,
      minRadius,
      maxRadius,
      smoothing,
      intensity,
      intensityMultipliers: customMultipliers,
    } = this.params;

    // Get raw audio value and normalize to 0-1
    let rawValue: number;
    switch (audioSource) {
      case "rms":
        // RMS is already 0-1, but typically peaks around 0.3-0.5
        rawValue = clamp(audioData.rms * 2, 0, 1);
        break;
      case "bass":
        rawValue = audioData.bass / 255;
        break;
      case "midLow":
        rawValue = audioData.midLow / 255;
        break;
      case "midHigh":
        rawValue = audioData.midHigh / 255;
        break;
      case "treble":
        rawValue = audioData.treble / 255;
        break;
      default:
        rawValue = clamp(audioData.rms * 2, 0, 1);
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

/**
 * Factory for creating MaskRadiusAnimator effect instances.
 */
export class MaskRadiusAnimatorFactory extends EffectFactory<
  MaskRadiusAnimatorParams,
  MaskRadiusAnimatorOutput
> {
  readonly type = "maskRadiusAnimator";
  readonly description = "Animates mask radius based on audio levels";

  getDefaultParams(): MaskRadiusAnimatorParams {
    return {
      intensity: EffectIntensity.MODERATE,
      enabled: true,
      audioSource: "rms",
      baseRadius: 50,
      minRadius: 20,
      maxRadius: 80,
      smoothing: 0.7,
    };
  }

  getDefaultOutput(): MaskRadiusAnimatorOutput {
    return {
      radius: 50,
      cssRadius: "50vh",
    };
  }

  protected createInstance(
    id: string,
    params: MaskRadiusAnimatorParams
  ): EffectInstance<MaskRadiusAnimatorParams, MaskRadiusAnimatorOutput> {
    return new MaskRadiusAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}

// Self-register the factory
EffectRegistry.register(new MaskRadiusAnimatorFactory());
