/**
 * Effect Engine - Singleton RAF loop manager.
 *
 * The EffectEngine runs independently from React's render cycle,
 * providing a pull-based model where components request current values
 * rather than receiving push updates.
 *
 * Features:
 * - Single RAF loop for all effects (efficient)
 * - Automatic start/stop based on registered effects
 * - Subscription system for change notifications
 * - FPS monitoring for debugging
 */

import { AudioDataProvider } from "./AudioDataProvider";
import {
  AudioFrameData,
  BaseEffectParams,
  EffectInstance,
  EffectOutput,
  EngineState,
} from "./types";

/**
 * Internal entry for a registered effect.
 */
interface EffectEntry {
  instance: EffectInstance<BaseEffectParams, EffectOutput>;
  currentOutput: EffectOutput;
  subscribers: Set<() => void>;
}

/**
 * EffectEngine singleton implementation.
 */
class EffectEngineImpl {
  private static instance: EffectEngineImpl | null = null;

  /** Registered effect instances */
  private effects: Map<string, EffectEntry> = new Map();

  /** RAF handle for cancellation */
  private animationFrameId: number | null = null;

  /** Timestamp of last frame for delta calculation */
  private lastFrameTime: number = 0;

  /** Total frames processed */
  private frameCount: number = 0;

  /** Rolling FPS history (last 60 samples) */
  private fpsHistory: number[] = [];

  /** Whether the loop is currently running */
  private isRunning: boolean = false;

  private constructor() {}

  static getInstance(): EffectEngineImpl {
    if (!EffectEngineImpl.instance) {
      EffectEngineImpl.instance = new EffectEngineImpl();
    }
    return EffectEngineImpl.instance;
  }

  /**
   * Registers an effect instance with the engine.
   * Automatically starts the RAF loop if this is the first effect.
   *
   * @param instance - The effect instance to register
   */
  registerEffect<TParams extends BaseEffectParams, TOutput extends EffectOutput>(
    instance: EffectInstance<TParams, TOutput>
  ): void {
    if (this.effects.has(instance.id)) {
      console.warn(
        `[EffectEngine] Effect "${instance.id}" already registered. Replacing.`
      );
      this.unregisterEffect(instance.id);
    }

    // Initialize the effect
    instance.start();

    // Register with initial output
    this.effects.set(instance.id, {
      instance: instance as EffectInstance<BaseEffectParams, EffectOutput>,
      currentOutput: instance.getCurrentOutput(),
      subscribers: new Set(),
    });

    // Start loop if this is the first effect
    if (!this.isRunning && this.effects.size > 0) {
      this.start();
    }
  }

  /**
   * Unregisters an effect and cleans up.
   * Stops the RAF loop if no effects remain.
   *
   * @param id - The effect ID to unregister
   */
  unregisterEffect(id: string): void {
    const entry = this.effects.get(id);
    if (entry) {
      // Call cleanup
      entry.instance.end();
      // Clear subscribers
      entry.subscribers.clear();
      // Remove from map
      this.effects.delete(id);
    }

    // Stop loop if no effects remain
    if (this.effects.size === 0) {
      this.stop();
    }
  }

  /**
   * Returns current output values for an effect.
   * This is the "pull" mechanism - components call this to get values.
   *
   * @param id - Effect ID
   * @returns Current output or null if not found
   */
  getEffectOutput<TOutput extends EffectOutput>(id: string): TOutput | null {
    const entry = this.effects.get(id);
    return entry ? (entry.currentOutput as TOutput) : null;
  }

  /**
   * Subscribes to value changes for an effect.
   * The callback is invoked after each frame where the effect updates.
   *
   * @param id - Effect ID to subscribe to
   * @param callback - Function called on update
   * @returns Unsubscribe function
   */
  subscribe(id: string, callback: () => void): () => void {
    const entry = this.effects.get(id);
    if (entry) {
      entry.subscribers.add(callback);
      return () => entry.subscribers.delete(callback);
    }
    // Return no-op if effect not found
    return () => {};
  }

  /**
   * Updates parameters for an effect.
   *
   * @param id - Effect ID
   * @param params - Partial parameters to merge
   */
  updateEffectParams<TParams extends BaseEffectParams>(
    id: string,
    params: Partial<TParams>
  ): void {
    const entry = this.effects.get(id);
    if (entry) {
      entry.instance.setParams(params);
    }
  }

  /**
   * Returns engine state for monitoring/debugging.
   */
  getState(): EngineState {
    const avgFps =
      this.fpsHistory.length > 0
        ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
        : 0;

    return {
      isRunning: this.isRunning,
      activeEffects: this.effects.size,
      frameCount: this.frameCount,
      averageFps: Math.round(avgFps * 10) / 10,
    };
  }

  /**
   * Checks if an effect is registered.
   */
  hasEffect(id: string): boolean {
    return this.effects.has(id);
  }

  /**
   * Gets all registered effect IDs.
   */
  getRegisteredEffectIds(): string[] {
    return Array.from(this.effects.keys());
  }

  /**
   * Starts the RAF loop.
   */
  private start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.tick();
  }

  /**
   * Stops the RAF loop.
   */
  private stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isRunning = false;
  }

  /**
   * Main animation frame tick.
   * Gets audio data, updates all effects, notifies subscribers.
   */
  private tick = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameCount++;

    // Track FPS (rolling window of 60 samples)
    const fps = deltaTime > 0 ? 1000 / deltaTime : 60;
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > 60) {
      this.fpsHistory.shift();
    }

    // Get global audio data once per frame
    const globalAudioData: AudioFrameData = AudioDataProvider.getFrameData();

    // Update all effects
    for (const [id, entry] of this.effects) {
      const params = entry.instance.getParams();

      // Skip disabled effects
      if (params.enabled === false) {
        continue;
      }

      // Get track-specific data if trackId is specified, otherwise use global
      const audioData = params.trackId
        ? AudioDataProvider.getTrackFrameData(params.trackId)
        : globalAudioData;

      // Update and store new output
      entry.currentOutput = entry.instance.update(audioData, deltaTime);

      // Notify subscribers
      for (const callback of entry.subscribers) {
        try {
          callback();
        } catch (error) {
          console.error("[EffectEngine] Subscriber callback error:", error);
        }
      }
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  /**
   * Force cleanup - destroys all effects and resets engine.
   * Useful for testing or hard reset scenarios.
   */
  destroy(): void {
    this.stop();
    for (const [id] of this.effects) {
      this.unregisterEffect(id);
    }
    this.frameCount = 0;
    this.fpsHistory = [];
    EffectEngineImpl.instance = null;
  }
}

/**
 * Public API for EffectEngine.
 */
export const EffectEngine = {
  getInstance: () => EffectEngineImpl.getInstance(),

  registerEffect: <TParams extends BaseEffectParams, TOutput extends EffectOutput>(
    instance: EffectInstance<TParams, TOutput>
  ) => EffectEngineImpl.getInstance().registerEffect(instance),

  unregisterEffect: (id: string) =>
    EffectEngineImpl.getInstance().unregisterEffect(id),

  getEffectOutput: <TOutput extends EffectOutput>(id: string) =>
    EffectEngineImpl.getInstance().getEffectOutput<TOutput>(id),

  subscribe: (id: string, callback: () => void) =>
    EffectEngineImpl.getInstance().subscribe(id, callback),

  updateEffectParams: <TParams extends BaseEffectParams>(
    id: string,
    params: Partial<TParams>
  ) => EffectEngineImpl.getInstance().updateEffectParams(id, params),

  getState: () => EffectEngineImpl.getInstance().getState(),

  hasEffect: (id: string) => EffectEngineImpl.getInstance().hasEffect(id),

  getRegisteredEffectIds: () =>
    EffectEngineImpl.getInstance().getRegisteredEffectIds(),

  destroy: () => EffectEngineImpl.getInstance().destroy(),
};
