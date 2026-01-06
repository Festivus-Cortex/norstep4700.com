/**
 * Abstract base class for effect factories.
 *
 * Each concrete factory creates effect instances for a specific visual property type.
 * Factories define default parameters, output shapes, and how intensity affects the effect.
 */

import {
  BaseEffectParams,
  EffectOutput,
  EffectInstance,
  EffectIntensity,
  DEFAULT_INTENSITY_MULTIPLIERS,
} from "./types";
import { mapRange, clamp } from "@/utils/math";

/**
 * Abstract base class that all effect factories extend.
 *
 * Type Parameters:
 * @template TParams - Effect-specific parameters (extends BaseEffectParams)
 * @template TOutput - Shape of the output values this effect produces
 */
export abstract class EffectFactory<
  TParams extends BaseEffectParams = BaseEffectParams,
  TOutput extends EffectOutput = EffectOutput
> {
  /**
   * Unique identifier for this factory type.
   * Used for registration and lookup.
   */
  abstract readonly type: string;

  /**
   * Human-readable description of what this effect does.
   */
  abstract readonly description: string;

  /**
   * Returns the default parameters for this effect type.
   * Subclasses must implement this.
   */
  abstract getDefaultParams(): TParams;

  /**
   * Returns the default output values.
   * Used before the first update and as fallback.
   */
  abstract getDefaultOutput(): TOutput;

  /**
   * Creates an effect instance with the given ID and parameters.
   *
   * @param id - Unique identifier for this instance
   * @param params - Effect parameters (merged with defaults)
   * @returns New effect instance
   */
  create(
    id: string,
    params: Partial<TParams> = {}
  ): EffectInstance<TParams, TOutput> {
    const mergedParams = { ...this.getDefaultParams(), ...params };
    return this.createInstance(id, mergedParams);
  }

  /**
   * Internal method to create the actual effect instance.
   * Subclasses implement this to create their specific effect type.
   *
   * @param id - Unique identifier
   * @param params - Fully merged parameters
   */
  protected abstract createInstance(
    id: string,
    params: TParams
  ): EffectInstance<TParams, TOutput>;

  /**
   * Returns intensity multipliers for each level.
   *
   * Subclasses can override this to customize the intensity curve.
   * Default values provide a linear progression from 20% to 100%.
   */
  protected getIntensityMultipliers(): Record<EffectIntensity, number> {
    return { ...DEFAULT_INTENSITY_MULTIPLIERS };
  }

  /**
   * Gets the effective intensity multiplier, considering any per-instance overrides.
   *
   * @param intensity - Current intensity level
   * @param customMultipliers - Optional per-instance overrides
   */
  protected getEffectiveMultiplier(
    intensity: EffectIntensity,
    customMultipliers?: Partial<Record<EffectIntensity, number>>
  ): number {
    const baseMultipliers = this.getIntensityMultipliers();
    const multipliers = { ...baseMultipliers, ...customMultipliers };
    return multipliers[intensity];
  }

  /**
   * FIXME PRESTON: CONSIDER CASES THAT MAY NOT USE NUMBERS!
   *
   * Applies intensity scaling to a raw normalized value.
   *
   * Takes a value in the 0-1 range and maps it to an output range,
   * scaling the effective range based on the intensity level.
   *
   * @param value - Raw normalized value (0-1)
   * @param intensity - Current intensity level
   * @param min - Minimum output value
   * @param max - Maximum output value
   * @param customMultipliers - Optional per-instance multiplier overrides
   * @returns Intensity-scaled value in the output range
   */
  protected applyIntensity(
    value: number,
    intensity: EffectIntensity,
    min: number,
    max: number,
    customMultipliers?: Partial<Record<EffectIntensity, number>>
  ): number {
    const multiplier = this.getEffectiveMultiplier(
      intensity,
      customMultipliers
    );
    const range = max - min;
    const effectiveRange = range * multiplier;

    // Center the effective range around the midpoint
    const midpoint = (min + max) / 2;
    const effectiveMin = midpoint - effectiveRange / 2;
    const effectiveMax = midpoint + effectiveRange / 2;

    // Map value to effective range
    const result = mapRange(value, 0, 1, effectiveMin, effectiveMax);
    return clamp(result, min, max);
  }

  /**
   * Applies intensity scaling with a base value offset.
   *
   * Similar to applyIntensity, but the range is centered around a base value
   * rather than the midpoint of min/max.
   *
   * @param value - Raw normalized value (0-1)
   * @param intensity - Current intensity level
   * @param base - Base value (center of effect)
   * @param min - Minimum output value
   * @param max - Maximum output value
   * @param customMultipliers - Optional per-instance multiplier overrides
   * @returns Intensity-scaled value centered on base
   */
  protected applyIntensityFromBase(
    value: number,
    intensity: EffectIntensity,
    base: number,
    min: number,
    max: number,
    customMultipliers?: Partial<Record<EffectIntensity, number>>
  ): number {
    const multiplier = this.getEffectiveMultiplier(
      intensity,
      customMultipliers
    );

    // Calculate distance from base to edges
    const rangeBelow = base - min;
    const rangeAbove = max - base;

    // Scale ranges by intensity
    const effectiveBelow = rangeBelow * multiplier;
    const effectiveAbove = rangeAbove * multiplier;

    // Map value centered on base
    // value 0.5 = base, <0.5 goes below, >0.5 goes above
    if (value < 0.5) {
      const t = value * 2; // 0 to 1 for below range
      const result = base - effectiveBelow * (1 - t);
      return clamp(result, min, max);
    } else {
      const t = (value - 0.5) * 2; // 0 to 1 for above range
      const result = base + effectiveAbove * t;
      return clamp(result, min, max);
    }
  }
}
