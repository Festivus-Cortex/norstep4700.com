/**
 * Effect Animators Index
 *
 * Central registration point for all effect animators.
 * Call registerAnimators() to explicitly register all animators with the EffectRegistry.
 */

import { EffectRegistry } from "../core/EffectRegistry";
import { MaskRadiusAnimatorFactory } from "./maskRadiusAnimator/MaskRadiusAnimatorFactory";
import { GradientTiltAnimatorFactory } from "./gradientTiltAnimator/GradientTiltAnimatorFactory";
import { ElementOpacityAnimatorFactory } from "./elementOpacityAnimator/ElementOpacityAnimatorFactory";
import { GradientScaleAnimatorFactory } from "./gradientScaleAnimator/GradientScaleAnimatorFactory";
import { GlitchIntensityAnimatorFactory } from "./glitchIntensityAnimator/GlitchIntensityAnimatorFactory";
import { GradientPositionAnimatorFactory } from "./gradientPositionAnimator/GradientPositionAnimatorFactory";

/**
 * Registers all animator factories with the EffectRegistry.
 * This function should be called once during application initialization,
 * before any effects are created.
 *
 * @example
 * ```typescript
 * // In your app initialization
 * registerAnimators();
 * ```
 */
export function registerAnimators(): void {
  EffectRegistry.register(new MaskRadiusAnimatorFactory());
  EffectRegistry.register(new GradientTiltAnimatorFactory());
  EffectRegistry.register(new ElementOpacityAnimatorFactory());
  EffectRegistry.register(new GradientScaleAnimatorFactory());
  EffectRegistry.register(new GlitchIntensityAnimatorFactory());
  EffectRegistry.register(new GradientPositionAnimatorFactory());
}

// Re-export factory types and params for consumer convenience
export {
  type MaskRadiusAnimatorParams,
  type MaskRadiusAnimatorOutput,
} from "./maskRadiusAnimator/types";

export {
  type GradientTiltAnimatorParams,
  type GradientTiltAnimatorOutput,
} from "./gradientTiltAnimator/types";

export {
  type ElementOpacityAnimatorParams,
  type ElementOpacityAnimatorOutput,
} from "./elementOpacityAnimator/types";

export {
  type GradientScaleAnimatorParams,
  type GradientScaleAnimatorOutput,
} from "./gradientScaleAnimator/types";

export {
  type GlitchIntensityAnimatorParams,
  type GlitchIntensityAnimatorOutput,
  type GlitchSpeed,
} from "./glitchIntensityAnimator/types";

export {
  type GradientPositionAnimatorParams,
  type GradientPositionAnimatorOutput,
  type MovementStyle,
} from "./gradientPositionAnimator/types";
