/**
 * MaskRadiusAnimatorFactory - Factory for creating MaskRadiusAnimator effect instances.
 */

import { EffectFactory } from "../../core/EffectFactory";
import { EffectInstance } from "../../core/types";
import { MaskRadiusAnimatorParams, MaskRadiusAnimatorOutput } from "./types";
import { MaskRadiusAnimatorEffectInstance } from "./MaskRadiusAnimator";

/**
 * Factory for creating MaskRadiusAnimator effect instances.
 */
export class MaskRadiusAnimatorFactory extends EffectFactory<
  MaskRadiusAnimatorParams,
  MaskRadiusAnimatorOutput
> {
  readonly type = "maskRadiusAnimator";
  readonly description = "Animates mask radius based on audio levels";

  protected createInstance(
    id: string,
    params: MaskRadiusAnimatorParams
  ): EffectInstance<MaskRadiusAnimatorParams, MaskRadiusAnimatorOutput> {
    return new MaskRadiusAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}
