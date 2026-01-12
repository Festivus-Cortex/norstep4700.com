/**
 * GradientScaleAnimatorFactory - Factory for creating GradientScaleAnimator effect instances.
 */

import { EffectFactory } from "../../core/EffectFactory";
import { EffectInstance } from "../../core/types";
import {
  GradientScaleAnimatorParams,
  GradientScaleAnimatorOutput,
} from "./types";
import { GradientScaleAnimatorEffectInstance } from "./GradientScaleAnimator";

/**
 * Factory for creating GradientScaleAnimator effect instances.
 */
export class GradientScaleAnimatorFactory extends EffectFactory<
  GradientScaleAnimatorParams,
  GradientScaleAnimatorOutput
> {
  readonly type = "gradientScaleAnimator";
  readonly description = "Animates gradient scale based on audio levels";

  protected createInstance(
    id: string,
    params: GradientScaleAnimatorParams
  ): EffectInstance<GradientScaleAnimatorParams, GradientScaleAnimatorOutput> {
    return new GradientScaleAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}
