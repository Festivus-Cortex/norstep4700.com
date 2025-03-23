"use client";

import { useEffect, useState } from "react";

enum AudioEffectAnimatorStrength {
  SUBTLE = "subtle",
  AVERAGE = "average",
  STRONG = "strong",
  INTENSE = "intense",
  EXTREME = "extreme",
}

interface AudioEffectAnimatorConfig<T> {
  props: {
    strength: AudioEffectAnimatorStrength;
  };
  targets: T;
}

function useAudioEffectAnimator<T>(config: AudioEffectAnimatorConfig<T>) {
  const [animatorEnabled, setAnimatorEnabled] = useState(false);

  useEffect(() => {
    // FIXME: Update logic, enable animator by default for now
    setAnimatorEnabled(true);

    const updateAnimation = (currentTime: number) => {
      console.log("updateAnimation", currentTime);
      if (!animatorEnabled) {
        return;
      }
    };
    requestAnimationFrame(updateAnimation);
    return () => setAnimatorEnabled(false);
  }, []);

  return { animatorEnabled, setAnimatorEnabled };
}

export { useAudioEffectAnimator, AudioEffectAnimatorStrength };
export type { AudioEffectAnimatorConfig };
