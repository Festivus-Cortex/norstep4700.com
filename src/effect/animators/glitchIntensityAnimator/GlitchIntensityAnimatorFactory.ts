/**
 * GlitchIntensityAnimatorFactory - Factory for creating GlitchIntensityAnimator effect instances.
 */

import { EffectFactory } from "../../core/EffectFactory";
import { EffectInstance } from "../../core/types";
import {
  GlitchIntensityAnimatorParams,
  GlitchIntensityAnimatorOutput,
} from "./types";
import { GlitchIntensityAnimatorEffectInstance } from "./GlitchIntensityAnimator";

/**
 * Factory for creating GlitchIntensityAnimator effect instances.
 */
export class GlitchIntensityAnimatorFactory extends EffectFactory<
  GlitchIntensityAnimatorParams,
  GlitchIntensityAnimatorOutput
> {
  readonly type = "glitchIntensityAnimator";
  readonly description =
    "Controls glitch effect intensity based on audio levels";

  protected createInstance(
    id: string,
    params: GlitchIntensityAnimatorParams
  ): EffectInstance<
    GlitchIntensityAnimatorParams,
    GlitchIntensityAnimatorOutput
  > {
    return new GlitchIntensityAnimatorEffectInstance(
      id,
      params,
      this.getIntensityMultipliers()
    );
  }
}
