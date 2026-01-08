"use client";

/**
 * React hook for direct DOM manipulation with audio effects.
 *
 * This is the RECOMMENDED approach for performance-critical animations.
 * Updates DOM elements directly without triggering React re-renders.
 *
 * Pattern used by: Framer Motion, react-spring, GSAP
 */

import { useCallback, useEffect, useRef } from "react";
import { EffectEngine } from "../../effect/core/EffectEngine";
import { EffectOutput } from "../../effect/core/types";

/**
 * Hook for efficient direct DOM manipulation based on effect values.
 *
 * Returns a ref callback that:
 * 1. Applies initial effect values when element mounts
 * 2. Subscribes to effect updates
 * 3. Applies updates directly to the DOM (no React re-renders)
 * 4. Cleans up on unmount
 *
 * @example
 * ```tsx
 * // Create the effect first
 * useEffectSubscription({
 *   type: 'maskRadiusAnimator',
 *   id: 'bg-mask',
 *   params: { intensity: EffectIntensity.MODERATE }
 * });
 *
 * // Then use the ref hook to apply values to DOM
 * const maskRef = useEffectRef<BackgroundMaskOutput>(
 *   'bg-mask',
 *   (element, values) => {
 *     element.style.setProperty('--mask-radius', values.cssRadius);
 *   }
 * );
 *
 * return <div ref={maskRef}>...</div>;
 * ```
 *
 * @template TOutput - Effect output type
 * @param effectId - The effect ID to subscribe to
 * @param applyValues - Function that applies values to the DOM element
 * @returns Ref callback to attach to your element
 */
export function useEffectRef<TOutput extends EffectOutput>(
  effectId: string,
  applyValues: (element: HTMLElement, values: TOutput) => void
): React.RefCallback<HTMLElement> {
  /** Track the current element */
  const elementRef = useRef<HTMLElement | null>(null);

  /** Track the unsubscribe function */
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /** Store applyValues in a ref to avoid re-subscriptions */
  const applyValuesRef = useRef(applyValues);
  applyValuesRef.current = applyValues;

  /**
   * Ref callback - called when element mounts/unmounts.
   * Just stores the element reference.
   */
  const refCallback = useCallback(
    (element: HTMLElement | null) => {
      elementRef.current = element;
    },
    [effectId]
  );

  // Subscribe in useEffect (runs after effect registration)
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Apply initial values
    const values = EffectEngine.getEffectOutput<TOutput>(effectId);
    if (values) {
      applyValuesRef.current(element, values);
    }

    // Subscribe to updates
    unsubscribeRef.current = EffectEngine.subscribe(effectId, () => {
      const newValues = EffectEngine.getEffectOutput<TOutput>(effectId);
      if (newValues && elementRef.current) {
        applyValuesRef.current(elementRef.current, newValues);
      }
    });

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [effectId]);

  return refCallback;
}

/**
 * Simplified hook for applying CSS variables from effect output.
 *
 * Automatically maps effect output properties to CSS custom properties.
 * Property names are converted from camelCase to kebab-case and prefixed.
 *
 * @example
 * ```tsx
 * // If effect outputs { maskRadius: 50, maskOpacity: 0.8 }
 * // This will set: --effect-mask-radius: 50; --effect-mask-opacity: 0.8;
 *
 * const ref = useEffectCSSVars('bg-mask', 'effect');
 * return <div ref={ref}>...</div>;
 * ```
 *
 * @param effectId - The effect ID to subscribe to
 * @param prefix - Prefix for CSS variable names (default: "effect")
 * @returns Ref callback to attach to your element
 */
export function useEffectCSSVars<TOutput extends EffectOutput>(
  effectId: string,
  prefix: string = "effect"
): React.RefCallback<HTMLElement> {
  return useEffectRef<TOutput>(effectId, (element, values) => {
    for (const [key, value] of Object.entries(values)) {
      // Convert camelCase to kebab-case
      const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      const cssVarName = `--${prefix}-${kebabKey}`;

      // Set the CSS variable
      if (typeof value === "number") {
        element.style.setProperty(cssVarName, String(value));
      } else if (typeof value === "string") {
        element.style.setProperty(cssVarName, value);
      }
    }
  });
}

/**
 * Hook for applying effect values to multiple CSS properties at once.
 *
 * Takes a mapping object that defines which effect properties map to which
 * CSS properties/variables.
 *
 * @example
 * ```tsx
 * const ref = useEffectStyleMap<BackgroundMaskOutput>('bg-mask', {
 *   cssRadius: '--mask-radius',
 *   cssOpacity: 'opacity',
 * });
 * return <div ref={ref}>...</div>;
 * ```
 *
 * @param effectId - The effect ID to subscribe to
 * @param mapping - Object mapping effect property names to CSS property/variable names
 * @returns Ref callback to attach to your element
 */
export function useEffectStyleMap<TOutput extends EffectOutput>(
  effectId: string,
  mapping: Partial<Record<keyof TOutput, string>>
): React.RefCallback<HTMLElement> {
  return useEffectRef<TOutput>(effectId, (element, values) => {
    for (const [effectProp, cssProp] of Object.entries(mapping)) {
      const value = values[effectProp as keyof TOutput];
      if (value === undefined) continue;

      const stringValue = typeof value === "number" ? String(value) : value;

      if ((cssProp as string).startsWith("--")) {
        // CSS custom property
        element.style.setProperty(cssProp as string, stringValue as string);
      } else {
        // Regular CSS property - use setProperty for consistency
        element.style.setProperty(cssProp as string, stringValue as string);
      }
    }
  });
}
