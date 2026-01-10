"use client";

import React, { useMemo } from "react";
import { useEffectSubscription, useEffectRef } from "@/hooks/effect";
import {
  MaskRadiusAnimatorParams,
  MaskRadiusAnimatorOutput,
} from "@/effect/animators";
import { useAudioState } from "@/context/AudioStateContext";
import { getEffectVariant } from "@/effect/config/loader";

// Import animators to trigger factory registration
import "@/effect/animators";

interface TrackVisualizerProps {
  trackId: string;
  trackName: string;
}

/**
 * Per-track audio visualizer component.
 *
 * Creates a visual indicator that reacts to the audio levels of a specific track.
 * Uses the MaskRadiusAnimator effect with per-track audio analysis.
 *
 * The visualizer will show empty/static state if audio data is not available,
 * and will animate when the track's audio analyzer is registered.
 */
export const TrackVisualizer: React.FC<TrackVisualizerProps> = ({
  trackId,
  trackName,
}) => {
  const effectId = `track-viz-${trackId}`;
  const { isEffectConfigInitialized } = useAudioState();

  // Get config params for trackVisualizer variant - only when initialized
  const configParams = useMemo(() => {
    if (!isEffectConfigInitialized) return null;
    return getEffectVariant("maskRadiusAnimator", "trackVisualizer");
  }, [isEffectConfigInitialized]);

  // Create effect subscription - only starts AFTER config is initialized
  // Hook is always called (Rules of Hooks), but autoStart controls when it runs
  useEffectSubscription<MaskRadiusAnimatorParams, MaskRadiusAnimatorOutput>({
    type: "maskRadiusAnimator",
    id: effectId,
    params: configParams
      ? {
          ...configParams,
          trackId, // Binds to specific track
          // intensity comes from config, can be overridden at runtime
        }
      : undefined,
    autoStart: isEffectConfigInitialized && configParams !== null,
  });

  // Use ref for performance (direct DOM manipulation)
  const vizRef = useEffectRef<MaskRadiusAnimatorOutput>(
    effectId,
    (element, values) => {
      // Scale based on radius value
      const scale = values.radius / 50;
      element.style.transform = `scale(${scale})`;

      // Opacity varies with audio level
      const opacity = 0.3 + ((values.radius - 10) / 80) * 0.6;
      element.style.opacity = `${opacity}`;
    }
  );

  return (
    <div
      ref={vizRef}
      style={{
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        background: "var(--accent-solid-medium)",
        boxShadow: "0 0 8px var(--accent-alpha-medium)",
        willChange: "transform, opacity",
        // NO initial opacity/transform - let the effect control it
      }}
      title={`${trackName} audio visualizer`}
    />
  );
};
