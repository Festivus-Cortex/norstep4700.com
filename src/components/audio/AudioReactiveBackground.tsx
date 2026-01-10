"use client";

import React, { useMemo } from "react";
import { Background } from "@/once-ui/components";
import { useAudioState } from "@/context/AudioStateContext";
import { getEffectDefaults } from "@/effect/config/loader";
import type { BackgroundProps } from "@/once-ui/components/Background";

/**
 * Audio-reactive Background component.
 *
 * This component loads the maskRadiusAnimator config and passes it to Background,
 * allowing Background to create audio-reactive effects with config values.
 */
export const AudioReactiveBackground: React.FC<BackgroundProps> = (props) => {
  const { isEffectConfigInitialized } = useAudioState();

  // Load background effect config params - only when initialized
  const backgroundEffectConfig = useMemo(() => {
    if (!isEffectConfigInitialized) return null;
    return getEffectDefaults("maskRadiusAnimator");
  }, [isEffectConfigInitialized]);

  // Merge config with audioReactiveMask prop
  const audioReactiveMaskWithConfig = useMemo(() => {
    if (!props.audioReactiveMask?.enabled || !backgroundEffectConfig) {
      return props.audioReactiveMask;
    }

    return {
      ...backgroundEffectConfig,
      ...props.audioReactiveMask,
    };
  }, [props.audioReactiveMask, backgroundEffectConfig]);

  return <Background {...props} audioReactiveMask={audioReactiveMaskWithConfig} />;
};
