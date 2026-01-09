/**
 * Effect Configuration Resolver
 *
 * Resolves effect parameters by merging defaults, intensity overrides,
 * variants, and custom params in priority order.
 */

import { BaseEffectParams, EffectIntensity } from "../core/types";
import {
  AudioAnalysisConfig,
  EffectSystemConfig,
  EffectsConfig,
} from "./types";
import { getEffectConfigSync } from "./loader";

/**
 * Options for resolving effect parameters
 */
export interface ResolveParamsOptions<TParams extends BaseEffectParams> {
  /** Effect type identifier (must match key in EffectsConfig) */
  effectType: keyof EffectsConfig;
  /** Desired intensity level */
  intensity: EffectIntensity;
  /** Optional variant name (e.g., "trackVisualizer") */
  variant?: string;
  /** Optional custom parameter overrides (highest priority) */
  customParams?: Partial<TParams>;
}

/**
 * Resolves effect parameters by merging configuration layers
 */
export class EffectConfigResolver {
  constructor(private config: EffectSystemConfig) {}

  /**
   * Resolves parameters for an effect instance.
   *
   * Resolution order (lowest to highest priority):
   * 1. Effect type defaults
   * 2. Intensity-specific overrides
   * 3. Variant configuration
   * 4. Custom parameters
   *
   * @param options - Resolution options
   * @returns Fully resolved effect parameters
   */
  resolveParams<TParams extends BaseEffectParams>(
    options: ResolveParamsOptions<TParams>
  ): TParams {
    const { effectType, intensity, variant, customParams } = options;

    const effectConfig = this.config.effects[effectType];
    if (!effectConfig) {
      throw new Error(`Unknown effect type: ${effectType}`);
    }

    // Start with base defaults
    let resolved: any = { ...effectConfig.defaults };

    // Apply intensity-specific overrides
    const intensityOverride = effectConfig.intensityOverrides?.[intensity];
    if (intensityOverride) {
      resolved = { ...resolved, ...intensityOverride };
    }

    // Apply variant if specified
    if (variant && effectConfig.variants?.[variant]) {
      const variantConfig = effectConfig.variants[variant];
      resolved = { ...resolved, ...variantConfig };
    }

    // Apply custom parameters (highest priority)
    if (customParams) {
      resolved = { ...resolved, ...customParams };
    }

    // Add base effect params that aren't in config
    const finalParams = {
      ...resolved,
      intensity,
      enabled: customParams?.enabled ?? true,
    } as TParams;

    return finalParams;
  }

  /**
   * Gets audio analysis configuration
   */
  getAudioConfig(): AudioAnalysisConfig {
    return this.config.audioAnalysis;
  }

  /**
   * Gets intensity multipliers for a specific effect type.
   * Currently returns global multipliers; could be extended to support
   * per-effect overrides in the future.
   *
   * @param effectType - Optional effect type (currently unused)
   * @returns Record of intensity to multiplier values
   */
  getIntensityMultipliers(
    effectType?: keyof EffectsConfig
  ): Record<EffectIntensity, number> {
    // For now, just return global multipliers
    // Future: could support per-effect overrides
    return this.config.intensityMultipliers;
  }

  /**
   * Gets frequency band configuration for a specific band.
   *
   * @param band - Band name (bass, midLow, midHigh, treble)
   * @returns Bin range for the frequency band
   */
  getFrequencyBand(band: "bass" | "midLow" | "midHigh" | "treble"): {
    start: number;
    end: number;
  } {
    return this.config.audioAnalysis.frequencyBands[band];
  }

  /**
   * Gets normalization constants for audio data processing.
   */
  getNormalization(): { rmsMultiplier: number; frequencyDivisor: number } {
    return this.config.audioAnalysis.normalization;
  }
}

/**
 * Creates a resolver instance with the current config.
 * If no config provided, uses the globally loaded config.
 *
 * @param config - Optional config to use instead of global
 * @returns Configured resolver instance
 */
export function createResolver(
  config?: EffectSystemConfig
): EffectConfigResolver {
  const effectiveConfig = config ?? getEffectConfigSync();
  return new EffectConfigResolver(effectiveConfig);
}
