"use client";

import React, { useEffect } from "react";
import { useEffectSubscription, useEffectRef } from "@/hooks/effect";
import {
  MaskRadiusAnimatorParams,
  MaskRadiusAnimatorOutput,
} from "@/effect/animators";
import { EffectIntensity } from "@/effect/core/types";
import { AudioDataProvider } from "@/effect/core/AudioDataProvider";

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
 * Returns null if audio system is not available or track analyzer is not registered.
 */
export const TrackVisualizer: React.FC<TrackVisualizerProps> = ({
  trackId,
  trackName,
}) => {
  // Don't render if audio system isn't available
  if (!AudioDataProvider.isAvailable()) {
    return null;
  }

  const effectId = `track-viz-${trackId}`;

  // Create effect bound to this specific track
  useEffectSubscription<MaskRadiusAnimatorParams, MaskRadiusAnimatorOutput>({
    type: "maskRadiusAnimator",
    id: effectId,
    params: {
      trackId, // BIND TO SPECIFIC TRACK
      intensity: EffectIntensity.STRONG,
      audioSource: "bass", // Bass is usually more prominent
      baseRadius: 50,
      minRadius: 10,
      maxRadius: 90,
      smoothing: 0.2, // Less smoothing = more responsive
    },
    autoStart: true,
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

  // Cleanup: Unregister track analyzer on unmount to prevent memory leaks
  // Note: This is a safety measure. The music set hook also unregisters analyzers,
  // but this ensures cleanup even if the visualizer unmounts independently.
  useEffect(() => {
    return () => {
      AudioDataProvider.unregisterTrackAnalyzer(trackId);
    };
  }, [trackId]);

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
