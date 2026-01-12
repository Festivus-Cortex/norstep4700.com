/**
 * Effect Animators Index
 *
 * Importing this module registers all animators with the EffectRegistry.
 * Import this in your app's entry point or where effects are needed.
 */

// Import animators to trigger self-registration
import "./maskRadiusAnimator/MaskRadiusAnimator";
import "./gradientTiltAnimator/GradientTiltAnimator";
import "./dotsOpacityAnimator/DotsOpacityAnimator";
import "./gradientScaleAnimator/GradientScaleAnimator";
import "./glitchIntensityAnimator/GlitchIntensityAnimator";
import "./gradientPositionAnimator/GradientPositionAnimator";

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
  type DotsOpacityAnimatorParams,
  type DotsOpacityAnimatorOutput,
} from "./dotsOpacityAnimator/types";

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
