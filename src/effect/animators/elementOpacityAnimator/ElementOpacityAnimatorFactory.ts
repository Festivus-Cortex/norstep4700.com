/**
 * ElementOpacityAnimatorFactory - Factory for creating ElementOpacityAnimator effect instances.
 */

import { EffectFactory } from "../../core/EffectFactory";
import { EffectInstance } from "../../core/types";
import { ElementOpacityAnimatorParams, ElementOpacityAnimatorOutput } from "./types";
import { ElementOpacityAnimatorEffectInstance } from "./ElementOpacityAnimator";

/**
 * Factory for creating ElementOpacityAnimator effect instances.
 */
export class ElementOpacityAnimatorFactory extends EffectFactory<
  ElementOpacityAnimatorParams,
  ElementOpacityAnimatorOutput
> {
  readonly type = "elementOpacityAnimator";
  readonly description = "Animates element opacity based on audio levels";

  protected createInstance(
    id: string,
    params: ElementOpacityAnimatorParams
  ): EffectInstance<ElementOpacityAnimatorParams, ElementOpacityAnimatorOutput> {
    return new ElementOpacityAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}
