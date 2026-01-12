/**
 * Core type definitions for the audio effect animator system.
 *
 * This module defines all interfaces and types used across the effect system,
 * including intensity levels, audio data structures, and effect lifecycles.
 */

/**
 * Intensity levels for audio effects.
 * Each level corresponds to a multiplier that scales the effect's output range.
 */
export enum EffectIntensity {
  SUBTLE = "subtle",
  MILD = "mild",
  MODERATE = "moderate",
  STRONG = "strong",
  EXTREME = "extreme",
}

/**
 * Default intensity multipliers.
 * These can be overridden per-factory or per-instance.
 */
export const DEFAULT_INTENSITY_MULTIPLIERS: Record<EffectIntensity, number> = {
  [EffectIntensity.SUBTLE]: 0.2,
  [EffectIntensity.MILD]: 0.4,
  [EffectIntensity.MODERATE]: 0.6,
  [EffectIntensity.STRONG]: 0.8,
  [EffectIntensity.EXTREME]: 1.0,
};

/**
 * Audio data snapshot provided to effects each frame.
 * Pre-computed frequency bands and metrics for efficient processing.
 */
export interface AudioFrameData {
  /** Raw frequency magnitude data (0-255 per bin) */
  frequencyData: Uint8Array;
  /** Raw waveform data (0-255, centered at 128) */
  timeDomainData: Uint8Array;
  /** Root Mean Square - overall volume level (0-1) */
  rms: number;
  /** Bass frequencies average - bins 0-10 (0-255) */
  bass: number;
  /** Low-mid frequencies average - bins 11-40 (0-255) */
  midLow: number;
  /** High-mid frequencies average - bins 41-80 (0-255) */
  midHigh: number;
  /** Treble frequencies average - bins 81-200 (0-255) */
  treble: number;
  /** High-precision timestamp from performance.now() */
  timestamp: number;
}

/**
 * Base output type for effect values.
 * Effects can output numbers, strings, and booleans.
 * Concrete effect outputs should extend this interface.
 */
export interface EffectOutput {
  [key: string]: number | string | boolean;
}

/**
 * Base parameters that all effects receive.
 * Individual factories extend this with their specific parameters.
 */
export interface BaseEffectParams {
  /** Current intensity level */
  intensity: EffectIntensity;
  /** Whether the effect is enabled (default: true) */
  enabled?: boolean;
  /** Optional custom intensity multipliers */
  intensityMultipliers?: Partial<Record<EffectIntensity, number>>;
  /** Optional track ID for per-track audio analysis */
  trackId?: string;
}

/**
 * Effect instance interface - what factories create.
 * Manages the lifecycle of a single effect.
 *
 * @template TParams - Effect-specific parameters type
 * @template TOutput - Effect output shape
 */
export interface EffectInstance<
  TParams extends BaseEffectParams,
  TOutput extends EffectOutput
> {
  /** Unique identifier for this instance */
  readonly id: string;
  /** Factory type that created this instance */
  readonly factoryType: string;

  /**
   * Called when the effect is registered with the engine.
   * Initialize any internal state here.
   */
  start(): void;

  /**
   * Called each animation frame to compute new values.
   * @param audioData - Current audio analysis data
   * @param deltaTime - Time since last frame in milliseconds
   * @returns Updated output values
   */
  update(audioData: AudioFrameData, deltaTime: number): TOutput;

  /**
   * Called when the effect is unregistered.
   * Clean up any resources here.
   */
  end(): void;

  /**
   * Update effect parameters at runtime.
   * @param params - Partial params to merge with existing
   */
  setParams(params: Partial<TParams>): void;

  /**
   * Get current parameters.
   */
  getParams(): TParams;

  /**
   * Get the most recent computed output.
   */
  getCurrentOutput(): TOutput;
}

/**
 * Subscription handle returned to React components.
 * Provides methods to interact with the effect from React.
 *
 * @template TOutput - Effect output shape
 */
export interface EffectSubscription<TOutput extends EffectOutput> {
  /** Effect instance ID */
  id: string;

  /**
   * Pull current effect values.
   * Call this to get the latest computed values.
   */
  getCurrentValues: () => TOutput;

  /**
   * Change the effect's intensity level.
   * @param intensity - New intensity level
   */
  setIntensity: (intensity: EffectIntensity) => void;

  /**
   * Update effect parameters.
   * @param params - Partial params to update
   */
  updateParams: (params: Record<string, unknown>) => void;

  /**
   * Unsubscribe and cleanup the effect.
   * Called automatically on component unmount.
   */
  unsubscribe: () => void;
}

/**
 * Engine state for monitoring and debugging.
 */
export interface EngineState {
  /** Whether the RAF loop is currently running */
  isRunning: boolean;
  /** Number of active effect instances */
  activeEffects: number;
  /** Total frames processed since start */
  frameCount: number;
  /** Rolling average FPS */
  averageFps: number;
}

/**
 * Audio analysis source options for effects.
 * Determines which audio analysis metric drives the effect.
 */
export type AudioAnalysisSource = "rms" | "bass" | "midLow" | "midHigh" | "treble";

/**
 * Helper type for CSS value outputs.
 * Effects typically output both raw numbers and CSS-formatted strings.
 */
export interface CSSValuePair {
  /** Raw numeric value */
  value: number;
  /** CSS-formatted string (e.g., "50vh", "0.5", "45deg") */
  css: string;
}
