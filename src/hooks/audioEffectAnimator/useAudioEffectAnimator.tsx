"use client";

import { useEffect, useState } from "react";
import { AudioEffectAnimatorConfig } from "./audioEffectAnimatorConfig";

function useAudioEffectAnimator(config: AudioEffectAnimatorConfig) {
  const [animatorEnabled, setAnimatorEnabled] = useState(true);
  const updateAnimation = (currentTime: number) => {
    /*console.log(
      "updateAnimation - animatorEnabled is %s and currentTime is %d",
      animatorEnabled.toString(),
      currentTime
    );*/
    if (!animatorEnabled) {
      return;
    }
    requestAnimationFrame(updateAnimation);
  };

  // Initialize update loop and one off items
  useEffect(() => {
    requestAnimationFrame(updateAnimation);
    return () => setAnimatorEnabled(false);
  }, []);

  // Re-enable updates when the enabled state is turned to true.
  useEffect(() => {
    if (!animatorEnabled) {
      return;
    }
    requestAnimationFrame(updateAnimation);
  }, [animatorEnabled]);

  return { animatorEnabled, setAnimatorEnabled };
}

export { useAudioEffectAnimator };
