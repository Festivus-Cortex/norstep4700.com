// FIXME: Add comments to this file
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
    // FIXME: Instead of passing around a Reach object, this should use callback functions.
    obj: React.Dispatch<React.SetStateAction<any>>; // object;
    propNames: string[];
    // TODO: Add more properties here, particularly mapping to an audio source somehow
  }[];
}
