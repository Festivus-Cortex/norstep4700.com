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

const animatorFactories = {
  maskRadius: new MaskRadiusAnimatorFactory(),
  gradientTilt: new GradientTiltAnimatorFactory(),
  elementOpacity: new ElementOpacityAnimatorFactory(),
  gradientScale: new GradientScaleAnimatorFactory(),
  glitchIntensity: new GlitchIntensityAnimatorFactory(),
  gradientPosition: new GradientPositionAnimatorFactory(),
};

// Global symbols retain logical ownership across Next.js module replacement,
// while the module-scoped instances handle repeated application initialization.
const animatorRegistrationKeys = {
  maskRadius: Symbol.for("norstep.effect.animator.maskRadius"),
  gradientTilt: Symbol.for("norstep.effect.animator.gradientTilt"),
  elementOpacity: Symbol.for("norstep.effect.animator.elementOpacity"),
  gradientScale: Symbol.for("norstep.effect.animator.gradientScale"),
  glitchIntensity: Symbol.for("norstep.effect.animator.glitchIntensity"),
  gradientPosition: Symbol.for("norstep.effect.animator.gradientPosition"),
};

/**
 * Registers all animator factories with the EffectRegistry.
 * Repeated calls are safe, including calls made after a development hot reload.
 *
 * @example
 * ```typescript
 * // In your app initialization
 * registerAnimators();
 * ```
 */
export function registerAnimators(): void {
  EffectRegistry.register(
    animatorFactories.maskRadius,
    animatorRegistrationKeys.maskRadius
  );
  EffectRegistry.register(
    animatorFactories.gradientTilt,
    animatorRegistrationKeys.gradientTilt
  );
  EffectRegistry.register(
    animatorFactories.elementOpacity,
    animatorRegistrationKeys.elementOpacity
  );
  EffectRegistry.register(
    animatorFactories.gradientScale,
    animatorRegistrationKeys.gradientScale
  );
  EffectRegistry.register(
    animatorFactories.glitchIntensity,
    animatorRegistrationKeys.glitchIntensity
  );
  EffectRegistry.register(
    animatorFactories.gradientPosition,
    animatorRegistrationKeys.gradientPosition
  );
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
