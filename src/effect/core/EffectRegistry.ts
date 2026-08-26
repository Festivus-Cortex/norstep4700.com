/**
 * Registry for dynamic effect factory registration.
 *
 * Factories are registered during application initialization, enabling:
 * - Dynamic discovery of available effects
 * - Tree-shaking of unused factories
 * - Runtime factory lookup by type string
 */

import type { EffectFactory } from "./EffectFactory";
import type { BaseEffectParams, EffectOutput } from "./types";

type RegisteredFactory = EffectFactory<BaseEffectParams, EffectOutput>;

interface RegisteredFactoryEntry {
  factory: RegisteredFactory;
  registrationKey?: symbol;
}

/**
 * EffectRegistry singleton implementation.
 *
 * Maintains a map of factory type strings to factory registrations.
 */
class EffectRegistryImpl {
  private static instance: EffectRegistryImpl | null = null;

  /** Map of factory type to factory registration */
  private factories: Map<string, RegisteredFactoryEntry> = new Map();

  private constructor() {}

  static getInstance(): EffectRegistryImpl {
    if (!EffectRegistryImpl.instance) {
      EffectRegistryImpl.instance = new EffectRegistryImpl();
    }
    return EffectRegistryImpl.instance;
  }

  /**
   * Registers a factory with the registry.
   * @param factory - The factory to register
   * @param registrationKey - Stable ownership identity. A registration with a
   * matching key is idempotent. A refreshed instance replaces the old instance;
   * a different key claiming the same factory type is treated as a conflict.
   * Without a key, only re-registering the same instance is idempotent.
   */
  register<TParams extends BaseEffectParams, TOutput extends EffectOutput>(
    factory: EffectFactory<TParams, TOutput>,
    registrationKey?: symbol
  ): void {
    const existing = this.factories.get(factory.type);

    if (existing) {
      const isSameRegistration =
        existing.factory === factory ||
        (registrationKey !== undefined &&
          existing.registrationKey === registrationKey);

      if (isSameRegistration) {
        // Refresh the instance after a hot reload while retaining ownership of
        // this factory type.
        existing.factory = factory as RegisteredFactory;
        return;
      }

      console.warn(
        `[EffectRegistry] Factory type "${factory.type}" already registered. Skipping duplicate.`
      );
      return;
    }

    this.factories.set(factory.type, {
      factory: factory as RegisteredFactory,
      registrationKey,
    });
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
    const factory = this.factories.get(type)?.factory;
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
    return new Map(
      Array.from(this.factories, ([type, entry]) => [type, entry.factory])
    );
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
    factory: EffectFactory<TParams, TOutput>,
    registrationKey?: symbol
  ) => EffectRegistryImpl.getInstance().register(factory, registrationKey),

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
