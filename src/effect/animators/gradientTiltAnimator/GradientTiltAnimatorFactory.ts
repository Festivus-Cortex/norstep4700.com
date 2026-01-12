/**
 * GradientTiltAnimatorFactory - Factory for creating GradientTiltAnimator effect instances.
 */

import { EffectFactory } from "../../core/EffectFactory";
import { EffectInstance } from "../../core/types";
import {
  GradientTiltAnimatorParams,
  GradientTiltAnimatorOutput,
} from "./types";
import { GradientTiltAnimatorEffectInstance } from "./GradientTiltAnimator";

/**
 * Factory for creating GradientTiltAnimator effect instances.
 */
export class GradientTiltAnimatorFactory extends EffectFactory<
  GradientTiltAnimatorParams,
  GradientTiltAnimatorOutput
> {
  readonly type = "gradientTiltAnimator";
  readonly description =
    "Animates gradient tilt/rotation based on audio levels";

  protected createInstance(
    id: string,
    params: GradientTiltAnimatorParams
  ): EffectInstance<GradientTiltAnimatorParams, GradientTiltAnimatorOutput> {
    return new GradientTiltAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}
