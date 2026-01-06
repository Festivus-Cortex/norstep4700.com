/**
 * Registry for dynamic effect factory registration.
 *
 * Factories register themselves at module load time, enabling:
 * - Dynamic discovery of available effects
 * - Tree-shaking of unused factories
 * - Runtime factory lookup by type string
 */

import { EffectFactory } from "./EffectFactory";
import { BaseEffectParams, EffectOutput } from "./types";

type RegisteredFactory = EffectFactory<BaseEffectParams, EffectOutput>;

/**
 * EffectRegistry singleton implementation.
 *
 * Maintains a map of factory type strings to factory instances.
 * Factories self-register when their module is imported.
 */
class EffectRegistryImpl {
  private static instance: EffectRegistryImpl | null = null;

  /** Map of factory type to factory instance */
  private factories: Map<string, RegisteredFactory> = new Map();

  private constructor() {}

  static getInstance(): EffectRegistryImpl {
    if (!EffectRegistryImpl.instance) {
      EffectRegistryImpl.instance = new EffectRegistryImpl();
    }
    return EffectRegistryImpl.instance;
  }

  /**
   * Registers a factory with the registry.
   * Called by factories at module load time.
   *
   * @param factory - The factory to register
   */
  register<TParams extends BaseEffectParams, TOutput extends EffectOutput>(
    factory: EffectFactory<TParams, TOutput>
  ): void {
    if (this.factories.has(factory.type)) {
      console.warn(
        `[EffectRegistry] Factory type "${factory.type}" already registered. Skipping duplicate.`
      );
      return;
    }

    this.factories.set(factory.type, factory as RegisteredFactory);
  }

  /**
   * Gets an animator by its type string.
   *
   * @param type - The animator type to retrieve
   * @returns The animator factory, or null if not found
   */
  getAnimator<TParams extends BaseEffectParams, TOutput extends EffectOutput>(
    type: string
  ): EffectFactory<TParams, TOutput> | null {
    const factory = this.factories.get(type);
    return (factory as EffectFactory<TParams, TOutput>) ?? null;
  }

  /**
   * Returns all registered animator type strings.
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Checks if an animator type is registered.
   *
   * @param type - The animator type to check
   */
  hasAnimator(type: string): boolean {
    return this.factories.has(type);
  }

  /**
   * Gets all registered animators.
   * Useful for debugging or building UIs that list available effects.
   */
  getAllAnimators(): Map<string, RegisteredFactory> {
    return new Map(this.factories);
  }

  /**
   * Clears all registered animators.
   * Primarily useful for testing.
   */
  clear(): void {
    this.factories.clear();
  }
}

/**
 * Public API for EffectRegistry.
 *
 * Usage:
 * ```ts
 * // From an effect animator:
 * EffectRegistry.register(new MaskRadiusAnimatorFactory());
 *
 * // To get an animator:
 * const animator = EffectRegistry.getAnimator('maskRadius');
 * ```
 */
export const EffectRegistry = {
  getInstance: () => EffectRegistryImpl.getInstance(),

  register: <TParams extends BaseEffectParams, TOutput extends EffectOutput>(
    factory: EffectFactory<TParams, TOutput>
  ) => EffectRegistryImpl.getInstance().register(factory),

  getAnimator: <TParams extends BaseEffectParams, TOutput extends EffectOutput>(
    type: string
  ) => EffectRegistryImpl.getInstance().getAnimator<TParams, TOutput>(type),

  getRegisteredTypes: () =>
    EffectRegistryImpl.getInstance().getRegisteredTypes(),

  hasAnimator: (type: string) =>
    EffectRegistryImpl.getInstance().hasAnimator(type),

  getAllAnimators: () => EffectRegistryImpl.getInstance().getAllAnimators(),

  clear: () => EffectRegistryImpl.getInstance().clear(),
};
