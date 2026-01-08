/**
 * Effect Animators Index
 *
 * Importing this module registers all animators with the EffectRegistry.
 * Import this in your app's entry point or where effects are needed.
 */

// Import animators to trigger self-registration
import "./MaskRadiusAnimator";

// Re-export factory types and params for consumer convenience
export {
  type MaskRadiusAnimatorParams,
  type MaskRadiusAnimatorOutput,
} from "./MaskRadiusAnimator";
