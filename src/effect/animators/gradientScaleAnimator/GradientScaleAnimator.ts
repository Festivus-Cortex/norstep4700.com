/**
 * GradientScaleAnimator - Audio-reactive gradient scale effect.
 *
 * Animates gradient width/height based on audio levels (typically mid-low).
 * Creates a breathing/pulsating effect that follows the music's rhythm.
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
  GradientScaleAnimatorParams,
  GradientScaleAnimatorOutput,
} from "./types";
import { getEffectConfigSync } from "../../config/loader";

/**
 * Internal effect instance for GradientScaleAnimator.
 */
class GradientScaleAnimatorEffectInstance implements EffectInstance<
  GradientScaleAnimatorParams,
  GradientScaleAnimatorOutput
> {
  readonly factoryType = "gradientScaleAnimator";

  private params: GradientScaleAnimatorParams;
  private currentOutput: GradientScaleAnimatorOutput;
  private smoothedWidthValue: number = 0;
  private smoothedHeightValue: number = 0;
  private intensityMultipliers: Record<EffectIntensity, number>;
  private normalization: { rmsMultiplier: number; frequencyDivisor: number };

  constructor(
    readonly id: string,
    params: GradientScaleAnimatorParams,
    intensityMultipliers: Record<EffectIntensity, number>
  ) {
    this.params = params;
    this.intensityMultipliers = intensityMultipliers;
    this.currentOutput = {
      width: params.baseWidth,
      height: params.baseHeight,
      cssWidth: `${params.baseWidth}%`,
      cssHeight: `${params.baseHeight}%`,
    };

    // Load normalization config
    const config = getEffectConfigSync();
    this.normalization = config.audioAnalysis.normalization;
  }

  start(): void {
    // Initialize smoothed values to center (0.5 maps to 1.0 = base scale)
    this.smoothedWidthValue = 0.5;
    this.smoothedHeightValue = 0.5;
  }

  update(
    audioData: AudioFrameData,
    deltaTime: number
  ): GradientScaleAnimatorOutput {
    const {
      audioAnalysisSource,
      baseWidth,
      baseHeight,
      minScale,
      maxScale,
      smoothing,
      intensity,
      aspectLock,
      intensityMultipliers: customMultipliers,
    } = this.params;

    // Helper to get normalized value from audio source
    const getAudioValue = (source: string): number => {
      switch (source) {
        case "rms":
          return clamp(audioData.rms * this.normalization.rmsMultiplier, 0, 1);
        case "bass":
          return audioData.bass / this.normalization.frequencyDivisor;
        case "midLow":
          return audioData.midLow / this.normalization.frequencyDivisor;
        case "midHigh":
          return audioData.midHigh / this.normalization.frequencyDivisor;
        case "treble":
          return audioData.treble / this.normalization.frequencyDivisor;
        default:
          return 0;
      }
    };

    // Get effective intensity multiplier
    const multipliers = { ...this.intensityMultipliers, ...customMultipliers };
    const multiplier = multipliers[intensity];

    // Calculate effective scale range based on intensity
    const scaleRange = maxScale - minScale;
    const effectiveRange = scaleRange * multiplier;
    const baseScale = 1.0;
    const effectiveMinScale = Math.max(
      minScale,
      baseScale - effectiveRange / 2
    );
    const effectiveMaxScale = Math.min(
      maxScale,
      baseScale + effectiveRange / 2
    );

    let width: number;
    let height: number;

    if (aspectLock) {
      // Both dimensions scale equally using the configured audio source
      const rawValue = getAudioValue(audioAnalysisSource);
      this.smoothedWidthValue = smoothDamp(
        this.smoothedWidthValue,
        rawValue,
        smoothing,
        deltaTime
      );
      const scaleFactor =
        effectiveMinScale +
        this.smoothedWidthValue * (effectiveMaxScale - effectiveMinScale);
      width = baseWidth * scaleFactor;
      height = baseHeight * scaleFactor;
    } else {
      // Width uses configured source, height uses a complementary source
      // This creates an ellipse that changes shape with the music
      const widthRaw = getAudioValue(audioAnalysisSource);
      // Use bass for width expansion, treble for height - creates interesting shapes
      const heightSource =
        audioAnalysisSource === "bass"
          ? "treble"
          : audioAnalysisSource === "treble"
            ? "bass"
            : audioAnalysisSource === "midLow"
              ? "midHigh"
              : "midLow";
      const heightRaw = getAudioValue(heightSource);

      this.smoothedWidthValue = smoothDamp(
        this.smoothedWidthValue,
        widthRaw,
        smoothing,
        deltaTime
      );
      this.smoothedHeightValue = smoothDamp(
        this.smoothedHeightValue,
        heightRaw,
        smoothing,
        deltaTime
      );

      const widthScaleFactor =
        effectiveMinScale +
        this.smoothedWidthValue * (effectiveMaxScale - effectiveMinScale);
      const heightScaleFactor =
        effectiveMinScale +
        this.smoothedHeightValue * (effectiveMaxScale - effectiveMinScale);

      width = baseWidth * widthScaleFactor;
      height = baseHeight * heightScaleFactor;
    }

    this.currentOutput = {
      width,
      height,
      cssWidth: `${width}%`,
      cssHeight: `${height}%`,
    };

    return this.currentOutput;
  }

  end(): void {
    // No cleanup needed
  }

  setParams(params: Partial<GradientScaleAnimatorParams>): void {
    this.params = { ...this.params, ...params };
  }

  getParams(): GradientScaleAnimatorParams {
    return { ...this.params };
  }

  getCurrentOutput(): GradientScaleAnimatorOutput {
    return { ...this.currentOutput };
  }
}

/**
 * Factory for creating GradientScaleAnimator effect instances.
 */
export class GradientScaleAnimatorFactory extends EffectFactory<
  GradientScaleAnimatorParams,
  GradientScaleAnimatorOutput
> {
  readonly type = "gradientScaleAnimator";
  readonly description = "Animates gradient scale based on audio levels";

  protected createInstance(
    id: string,
    params: GradientScaleAnimatorParams
  ): EffectInstance<GradientScaleAnimatorParams, GradientScaleAnimatorOutput> {
    return new GradientScaleAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}

// Self-register the factory
EffectRegistry.register(new GradientScaleAnimatorFactory());
