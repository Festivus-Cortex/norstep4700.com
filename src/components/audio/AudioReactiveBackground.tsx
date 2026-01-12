"use client";

import React, { useMemo } from "react";
import { Background } from "@/once-ui/components";
import { useAudioState } from "@/context/AudioStateContext";
import { getEffectDefaults } from "@/effect/config/loader";
import type { BackgroundProps } from "@/once-ui/components/Background";

/**
 * Audio-reactive Background component.
 *
 * This component loads effect configs and passes them to Background,
 * allowing Background to create audio-reactive effects with config values.
 */
export const AudioReactiveBackground: React.FC<BackgroundProps> = (props) => {
  const { isEffectConfigInitialized, tracks } = useAudioState();

  // Only enable audio-reactive effects when tracks are loaded (music set is loaded)
  const haveTracksLoaded = tracks.length > 0;

  // Load effect configs - only when initialized
  const maskConfig = useMemo(() => {
    if (!isEffectConfigInitialized) return null;
    return getEffectDefaults("maskRadiusAnimator");
  }, [isEffectConfigInitialized]);

  const gradientTiltConfig = useMemo(() => {
    if (!isEffectConfigInitialized) return null;
    return getEffectDefaults("gradientTiltAnimator");
  }, [isEffectConfigInitialized]);

  const gradientScaleConfig = useMemo(() => {
    if (!isEffectConfigInitialized) return null;
    return getEffectDefaults("gradientScaleAnimator");
  }, [isEffectConfigInitialized]);

  const gradientPositionConfig = useMemo(() => {
    if (!isEffectConfigInitialized) return null;
    return getEffectDefaults("gradientPositionAnimator");
  }, [isEffectConfigInitialized]);

  const elementOpacityConfig = useMemo(() => {
    if (!isEffectConfigInitialized) return null;
    return getEffectDefaults("elementOpacityAnimator");
  }, [isEffectConfigInitialized]);

  // Merge configs with props - only enable when tracks are loaded
  const audioReactiveMaskWithConfig = useMemo(() => {
    if (!props.audioReactiveMask?.enabled || !maskConfig) {
      return props.audioReactiveMask;
    }
    // Disable effect if no tracks are loaded
    if (!haveTracksLoaded) {
      return { ...props.audioReactiveMask, enabled: false };
    }
    return { ...maskConfig, ...props.audioReactiveMask };
  }, [props.audioReactiveMask, maskConfig, haveTracksLoaded]);

  const audioReactiveGradientTiltWithConfig = useMemo(() => {
    if (!props.audioReactiveGradientTilt?.enabled || !gradientTiltConfig) {
      return props.audioReactiveGradientTilt;
    }
    if (!haveTracksLoaded) {
      return { ...props.audioReactiveGradientTilt, enabled: false };
    }
    return { ...gradientTiltConfig, ...props.audioReactiveGradientTilt };
  }, [props.audioReactiveGradientTilt, gradientTiltConfig, haveTracksLoaded]);

  const audioReactiveGradientScaleWithConfig = useMemo(() => {
    if (!props.audioReactiveGradientScale?.enabled || !gradientScaleConfig) {
      return props.audioReactiveGradientScale;
    }
    if (!haveTracksLoaded) {
      return { ...props.audioReactiveGradientScale, enabled: false };
    }
    return { ...gradientScaleConfig, ...props.audioReactiveGradientScale };
  }, [props.audioReactiveGradientScale, gradientScaleConfig, haveTracksLoaded]);

  const audioReactiveGradientPositionWithConfig = useMemo(() => {
    if (
      !props.audioReactiveGradientPosition?.enabled ||
      !gradientPositionConfig
    ) {
      return props.audioReactiveGradientPosition;
    }
    if (!haveTracksLoaded) {
      return { ...props.audioReactiveGradientPosition, enabled: false };
    }
    return {
      ...gradientPositionConfig,
      ...props.audioReactiveGradientPosition,
    };
  }, [
    props.audioReactiveGradientPosition,
    gradientPositionConfig,
    haveTracksLoaded,
  ]);

  const audioReactiveElementOpacityWithConfig = useMemo(() => {
    if (!props.audioReactiveElementOpacity?.enabled || !elementOpacityConfig) {
      return props.audioReactiveElementOpacity;
    }
    if (!haveTracksLoaded) {
      return { ...props.audioReactiveElementOpacity, enabled: false };
    }
    return { ...elementOpacityConfig, ...props.audioReactiveElementOpacity };
  }, [props.audioReactiveElementOpacity, elementOpacityConfig, haveTracksLoaded]);

  return (
    <Background
      {...props}
      audioReactiveMask={audioReactiveMaskWithConfig}
      audioReactiveGradientTilt={audioReactiveGradientTiltWithConfig}
      audioReactiveGradientScale={audioReactiveGradientScaleWithConfig}
      audioReactiveGradientPosition={audioReactiveGradientPositionWithConfig}
      audioReactiveElementOpacity={audioReactiveElementOpacityWithConfig}
    />
  );
};
