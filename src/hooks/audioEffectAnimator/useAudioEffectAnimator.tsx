"use client";

import { useCallback, useEffect, useState } from "react";
import { AudioEffectAnimatorConfig } from "./audioEffectAnimatorConfig";

function useAudioEffectAnimator(config: AudioEffectAnimatorConfig) {
  const [animatorEnabled, setAnimatorEnabled] = useState(true);
  const updateAnimation = useCallback(
    (currentTime: number) => {
      /*console.log(
        "updateAnimation - animatorEnabled is %s and currentTime is %d",
        animatorEnabled.toString(),
        currentTime
      );*/
      if (!animatorEnabled) {
        return;
      }
      // FIXME: TESTING
      /*const mask = { radius: Math.random() * 100 };
      config.targets[0].obj(mask);
      requestAnimationFrame(updateAnimation);*/

      // FIXME: this should use callback functions versus handling logic in
    },
    [animatorEnabled]
  );

  // Initialize update loop and one off items
  useEffect(() => {
    const animationFrameId = requestAnimationFrame(updateAnimation);
    return () => {
      setAnimatorEnabled(false);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return { animatorEnabled, setAnimatorEnabled };
}

const calculateEffectMapping = () => {
  // const analyser = ctx.createAnalyser();*/
};

export { useAudioEffectAnimator };
