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
  const { isEffectConfigInitialized } = useAudioState();

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

  const dotsOpacityConfig = useMemo(() => {
    if (!isEffectConfigInitialized) return null;
    return getEffectDefaults("dotsOpacityAnimator");
  }, [isEffectConfigInitialized]);

  // Merge configs with props
  const audioReactiveMaskWithConfig = useMemo(() => {
    if (!props.audioReactiveMask?.enabled || !maskConfig) {
      return props.audioReactiveMask;
    }
    return { ...maskConfig, ...props.audioReactiveMask };
  }, [props.audioReactiveMask, maskConfig]);

  const audioReactiveGradientTiltWithConfig = useMemo(() => {
    if (!props.audioReactiveGradientTilt?.enabled || !gradientTiltConfig) {
      return props.audioReactiveGradientTilt;
    }
    return { ...gradientTiltConfig, ...props.audioReactiveGradientTilt };
  }, [props.audioReactiveGradientTilt, gradientTiltConfig]);

  const audioReactiveGradientScaleWithConfig = useMemo(() => {
    if (!props.audioReactiveGradientScale?.enabled || !gradientScaleConfig) {
      return props.audioReactiveGradientScale;
    }
    return { ...gradientScaleConfig, ...props.audioReactiveGradientScale };
  }, [props.audioReactiveGradientScale, gradientScaleConfig]);

  const audioReactiveGradientPositionWithConfig = useMemo(() => {
    if (!props.audioReactiveGradientPosition?.enabled || !gradientPositionConfig) {
      return props.audioReactiveGradientPosition;
    }
    return { ...gradientPositionConfig, ...props.audioReactiveGradientPosition };
  }, [props.audioReactiveGradientPosition, gradientPositionConfig]);

  const audioReactiveDotsOpacityWithConfig = useMemo(() => {
    if (!props.audioReactiveDotsOpacity?.enabled || !dotsOpacityConfig) {
      return props.audioReactiveDotsOpacity;
    }
    return { ...dotsOpacityConfig, ...props.audioReactiveDotsOpacity };
  }, [props.audioReactiveDotsOpacity, dotsOpacityConfig]);

  return (
    <Background
      {...props}
      audioReactiveMask={audioReactiveMaskWithConfig}
      audioReactiveGradientTilt={audioReactiveGradientTiltWithConfig}
      audioReactiveGradientScale={audioReactiveGradientScaleWithConfig}
      audioReactiveGradientPosition={audioReactiveGradientPositionWithConfig}
      audioReactiveDotsOpacity={audioReactiveDotsOpacityWithConfig}
    />
  );
};
