/**
 * GradientPositionAnimatorFactory - Factory for creating GradientPositionAnimator effect instances.
 */

import { EffectFactory } from "../../core/EffectFactory";
import { EffectInstance } from "../../core/types";
import {
  GradientPositionAnimatorParams,
  GradientPositionAnimatorOutput,
} from "./types";
import { GradientPositionAnimatorEffectInstance } from "./GradientPositionAnimator";

/**
 * Factory for creating GradientPositionAnimator effect instances.
 */
export class GradientPositionAnimatorFactory extends EffectFactory<
  GradientPositionAnimatorParams,
  GradientPositionAnimatorOutput
> {
  readonly type = "gradientPositionAnimator";
  readonly description = "Animates gradient position based on audio peaks";

  protected createInstance(
    id: string,
    params: GradientPositionAnimatorParams
  ): EffectInstance<
    GradientPositionAnimatorParams,
    GradientPositionAnimatorOutput
  > {
    return new GradientPositionAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}
