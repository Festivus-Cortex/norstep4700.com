/**
 * GradientPositionAnimator - Audio-reactive gradient position effect.
 *
 * Moves gradient center position based on audio peaks (transient detection).
 * Creates dynamic movement that emphasizes rhythmic beats.
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
  GradientPositionAnimatorParams,
  GradientPositionAnimatorOutput,
} from "./types";
import { getEffectConfigSync } from "../../config/loader";

/**
 * Internal effect instance for GradientPositionAnimator.
 */
class GradientPositionAnimatorEffectInstance
  implements EffectInstance<GradientPositionAnimatorParams, GradientPositionAnimatorOutput>
{
  readonly factoryType = "gradientPositionAnimator";

  private params: GradientPositionAnimatorParams;
  private currentOutput: GradientPositionAnimatorOutput;
  private intensityMultipliers: Record<EffectIntensity, number>;
  private normalization: { rmsMultiplier: number; frequencyDivisor: number };

  // Position tracking
  private currentX: number;
  private currentY: number;
  private targetX: number;
  private targetY: number;

  // Peak detection
  private previousAudioLevel: number = 0;
  private peakOffsetX: number = 0;
  private peakOffsetY: number = 0;

  // Radial movement state
  private radialAngle: number = 0;

  constructor(
    readonly id: string,
    params: GradientPositionAnimatorParams,
    intensityMultipliers: Record<EffectIntensity, number>
  ) {
    this.params = params;
    this.intensityMultipliers = intensityMultipliers;
    this.currentX = params.baseX;
    this.currentY = params.baseY;
    this.targetX = params.baseX;
    this.targetY = params.baseY;
    this.currentOutput = {
      x: params.baseX,
      y: params.baseY,
      cssX: `${params.baseX}%`,
      cssY: `${params.baseY}%`,
    };

    // Load normalization config
    const config = getEffectConfigSync();
    this.normalization = config.audioAnalysis.normalization;
  }

  start(): void {
    this.currentX = this.params.baseX;
    this.currentY = this.params.baseY;
    this.targetX = this.params.baseX;
    this.targetY = this.params.baseY;
    this.previousAudioLevel = 0;
    this.peakOffsetX = 0;
    this.peakOffsetY = 0;
    this.radialAngle = 0;
  }

  update(
    audioData: AudioFrameData,
    deltaTime: number
  ): GradientPositionAnimatorOutput {
    const {
      audioAnalysisSource,
      baseX,
      baseY,
      maxDeviation,
      smoothing,
      peakThreshold,
      peakDecay,
      movementStyle,
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
          "gradientPositionAnimator has no way to analyze for given method of: " +
            audioAnalysisSource
        );
    }

    // Get effective intensity multiplier
    const multipliers = { ...this.intensityMultipliers, ...customMultipliers };
    const multiplier = multipliers[intensity];

    // Apply intensity to max deviation
    const effectiveDeviation = maxDeviation * multiplier;

    // Peak detection: check if audio level jumped significantly
    const audioDelta = rawValue - this.previousAudioLevel;
    const isPeak = audioDelta > peakThreshold;
    this.previousAudioLevel = rawValue;

    // On peak, trigger movement based on style
    if (isPeak) {
      switch (movementStyle) {
        case "random":
          // Random direction
          this.peakOffsetX = (Math.random() - 0.5) * 2 * effectiveDeviation;
          this.peakOffsetY = (Math.random() - 0.5) * 2 * effectiveDeviation;
          break;
        case "radial":
          // Rotate around base position
          this.radialAngle += Math.PI / 4 + Math.random() * Math.PI / 4;
          this.peakOffsetX = Math.cos(this.radialAngle) * effectiveDeviation * rawValue;
          this.peakOffsetY = Math.sin(this.radialAngle) * effectiveDeviation * rawValue;
          break;
        case "bounce":
          // Bounce outward from center based on audio intensity
          const angle = Math.random() * Math.PI * 2;
          const distance = effectiveDeviation * rawValue;
          this.peakOffsetX = Math.cos(angle) * distance;
          this.peakOffsetY = Math.sin(angle) * distance;
          break;
      }
    }

    // Decay peak offset back toward zero
    this.peakOffsetX *= peakDecay;
    this.peakOffsetY *= peakDecay;

    // Calculate target position
    this.targetX = baseX + this.peakOffsetX;
    this.targetY = baseY + this.peakOffsetY;

    // Smooth current position toward target
    this.currentX = smoothDamp(this.currentX, this.targetX, smoothing, deltaTime);
    this.currentY = smoothDamp(this.currentY, this.targetY, smoothing, deltaTime);

    // Clamp to valid range (allowing some overflow for visual effect)
    const clampedX = clamp(this.currentX, 0, 100);
    const clampedY = clamp(this.currentY, 0, 100);

    this.currentOutput = {
      x: clampedX,
      y: clampedY,
      cssX: `${clampedX}%`,
      cssY: `${clampedY}%`,
    };

    return this.currentOutput;
  }

  end(): void {
    // No cleanup needed
  }

  setParams(params: Partial<GradientPositionAnimatorParams>): void {
    this.params = { ...this.params, ...params };
  }

  getParams(): GradientPositionAnimatorParams {
    return { ...this.params };
  }

  getCurrentOutput(): GradientPositionAnimatorOutput {
    return { ...this.currentOutput };
  }
}

/**
 * Factory for creating GradientPositionAnimator effect instances.
 */
export class GradientPositionAnimatorFactory extends EffectFactory<
  GradientPositionAnimatorParams,
  GradientPositionAnimatorOutput
> {
  readonly type = "gradientPositionAnimator";
  readonly description = "Animates gradient position based on audio peaks";

  protected createInstance(
    id: string,
    params: GradientPositionAnimatorParams
  ): EffectInstance<GradientPositionAnimatorParams, GradientPositionAnimatorOutput> {
    return new GradientPositionAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}

// Self-register the factory
EffectRegistry.register(new GradientPositionAnimatorFactory());
