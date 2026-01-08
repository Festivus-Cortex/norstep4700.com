"use client";

import React from "react";
import { useEffectSubscription, useEffectRef } from "@/hooks/effect";
import {
  MaskRadiusAnimatorParams,
  MaskRadiusAnimatorOutput,
} from "@/effect/animators";
import { EffectIntensity } from "@/effect/core/types";

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

  // Create effect bound to this specific track
  useEffectSubscription<MaskRadiusAnimatorParams, MaskRadiusAnimatorOutput>({
    type: "maskRadiusAnimator",
    id: effectId,
    params: {
      trackId, // BIND TO SPECIFIC TRACK
      intensity: EffectIntensity.STRONG,
      audioAnalysisSource: "bass", // Bass is usually more prominent
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
