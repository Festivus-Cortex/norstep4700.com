export enum AudioEffectAnimatorStrength {
  SUBTLE = "subtle",
  AVERAGE = "average",
  STRONG = "strong",
  INTENSE = "intense",
  EXTREME = "extreme",
}

export interface AudioEffectAnimatorConfig {
  props: {
    strength: AudioEffectAnimatorStrength;
  };
  targets: {
    obj: Object;
    propNames: string[];
    // TODO: Add more properties here, particularly mapping to an audio source somehow
  }[];
}
