"use client";

/**
 * React hook for subscribing to audio effects.
 *
 * Provides a clean API for React components to create and manage effect instances.
 * Handles registration, cleanup, and parameter updates automatically.
 */

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { EffectEngine } from "../../effect/core/EffectEngine";
import { EffectRegistry } from "../../effect/core/EffectRegistry";
import {
  EffectIntensity,
  EffectOutput,
  BaseEffectParams,
  EffectSubscription,
} from "../../effect/core/types";

/**
 * Options for useEffectSubscription hook.
 */
export interface UseEffectOptions<TParams extends BaseEffectParams> {
  /** Factory type to use (must be registered) */
  type: string;
  /** Unique ID for this effect instance */
  id: string;
  /** Initial parameters (merged with factory defaults) */
  params?: Partial<TParams>;
  /** Whether to start immediately (default: true) */
  autoStart?: boolean;
  /** Optional variant name from config (e.g., "trackVisualizer") */
  variant?: string;
}

/**
 * Main hook for React components to subscribe to audio effects.
 *
 * Creates an effect instance when the component mounts, and cleans up
 * when it unmounts. Returns a subscription object for interacting with
 * the effect.
 *
 * @example
 * ```tsx
 * const subscription = useEffectSubscription({
 *   type: 'maskRadiusAnimator',
 *   id: 'my-mask-effect',
 *   params: { intensity: EffectIntensity.MODERATE }
 * });
 *
 * // Pull current values
 * const values = subscription?.getCurrentValues();
 *
 * // Change intensity
 * subscription?.setIntensity(EffectIntensity.STRONG);
 * ```
 *
 * @template TParams - Effect parameter type
 * @template TOutput - Effect output type
 */
export function useEffectSubscription<
  TParams extends BaseEffectParams = BaseEffectParams,
  TOutput extends EffectOutput = EffectOutput
>(options: UseEffectOptions<TParams>): EffectSubscription<TOutput> | null {
  const { type, id, params, autoStart = true, variant } = options;

  /** Track the instance ID for cleanup */
  const instanceIdRef = useRef<string | null>(null);

  /** Track if we're subscribed */
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Create and register effect instance on mount
  useEffect(() => {
    if (!autoStart) return;

    let isMounted = true;

    // Async function to create effect
    // Note: Effect config is preloaded in AudioStateProvider
    const initEffect = async () => {
      try {
        // Check if component is still mounted
        if (!isMounted) {
          return;
        }

        console.log(`[useEffectSubscription] Initializing ${type} with id ${id}`);

        // Get the animator
        const factory = EffectRegistry.getAnimator<TParams, TOutput>(type);
        if (!factory) {
          console.error(
            `[useEffectSubscription] Animator "${type}" not found. ` +
              `Available types: ${
                EffectRegistry.getRegisteredTypes().join(", ") || "(none)"
              }`
          );
          return;
        }

        // Create and register the instance (use variant if specified)
        const instance = variant
          ? factory.createFromVariant(id, variant, params)
          : factory.create(id, params);
        EffectEngine.registerEffect(instance);
        instanceIdRef.current = id;
        setIsSubscribed(true);
        console.log(`[useEffectSubscription] Successfully registered ${type} with id ${id}`);
      } catch (error) {
        console.error("[useEffectSubscription] Failed to initialize effect:", error);
      }
    };

    initEffect();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (instanceIdRef.current) {
        EffectEngine.unregisterEffect(instanceIdRef.current);
        instanceIdRef.current = null;
        setIsSubscribed(false);
      }
    };
    // Note: params intentionally excluded to avoid re-creating the effect
    // Use updateParams for runtime changes
  }, [type, id, autoStart, variant]);

  // Update params when they change (without re-creating the effect)
  useEffect(() => {
    if (instanceIdRef.current && params) {
      EffectEngine.updateEffectParams(instanceIdRef.current, params);
    }
  }, [params]);

  // Build the subscription interface
  const getCurrentValues = useCallback((): TOutput => {
    if (!instanceIdRef.current) {
      return {} as TOutput;
    }
    return (
      EffectEngine.getEffectOutput<TOutput>(instanceIdRef.current) ??
      ({} as TOutput)
    );
  }, []);

  const setIntensity = useCallback((intensity: EffectIntensity): void => {
    if (instanceIdRef.current) {
      EffectEngine.updateEffectParams(instanceIdRef.current, { intensity });
    }
  }, []);

  const updateParams = useCallback(
    (newParams: Record<string, unknown>): void => {
      if (instanceIdRef.current) {
        EffectEngine.updateEffectParams(instanceIdRef.current, newParams);
      }
    },
    []
  );

  const unsubscribe = useCallback((): void => {
    if (instanceIdRef.current) {
      EffectEngine.unregisterEffect(instanceIdRef.current);
      instanceIdRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  // Return subscription or null if not subscribed
  const subscription = useMemo<EffectSubscription<TOutput> | null>(() => {
    if (!isSubscribed || !instanceIdRef.current) {
      return null;
    }

    return {
      id: instanceIdRef.current,
      getCurrentValues,
      setIntensity,
      updateParams,
      unsubscribe,
    };
  }, [isSubscribed, getCurrentValues, setIntensity, updateParams, unsubscribe]);

  return subscription;
}

/**
 * Hook for pulling current effect values with automatic re-render on change.
 *
 * WARNING: This causes a re-render on every frame where the effect updates.
 * Use sparingly - prefer useEffectRef for performance-critical animations.
 *
 * @param effectId - The effect ID to get values from
 * @returns Current output values or null if effect not found
 */
export function useEffectValues<TOutput extends EffectOutput>(
  effectId: string
): TOutput | null {
  const [values, setValues] = useState<TOutput | null>(null);

  useEffect(() => {
    // Get initial value
    setValues(EffectEngine.getEffectOutput<TOutput>(effectId));

    // Subscribe to updates
    const unsubscribe = EffectEngine.subscribe(effectId, () => {
      setValues(EffectEngine.getEffectOutput<TOutput>(effectId));
    });

    return unsubscribe;
  }, [effectId]);

  return values;
}
