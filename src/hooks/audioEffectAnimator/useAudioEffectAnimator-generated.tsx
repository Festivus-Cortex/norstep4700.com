"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { AudioEffectAnimatorConfig } from "./audioEffectAnimatorConfig";
import {
  calculateRMS,
  calculateSpectralCentroid,
  getFrequencyBand,
  getFrequencyData,
  getTimeDomainData,
} from "@/app/audio/utils";

// FIXME: Generated content updates from ai agent. some of this is potentially
// useful but needs migrated. Storing as a copy for now.

function useAudioEffectAnimatorTestGenerated(
  config: AudioEffectAnimatorConfig
) {
  const [animatorEnabled, setAnimatorEnabled] = useState(true);
  const animationFrameRef = useRef<number>(0);

  const updateAnimation = useCallback(
    (timestamp?: number) => {
      if (!animatorEnabled) {
        return;
      }

      // Get current audio data
      const frequencyData = getFrequencyData();
      const timeDomainData = getTimeDomainData();

      // Calculate audio properties FIXME: Verify functionality and comment
      // better. Ensure volume mapping is correct and bin math is right.

      const volume = calculateRMS(timeDomainData);
      const bassLevel = getFrequencyBand(frequencyData, 0, 5); // 20-250 Hz
      const midLevel = getFrequencyBand(frequencyData, 11, 40); // 500-2000 Hz
      const trebleLevel = getFrequencyBand(frequencyData, 81, 200); // 4-10 kHz
      const spectralCentroid = calculateSpectralCentroid(frequencyData);

      // FIXME: Clean up generated mapping if used
      // Map audio properties to visual effects based on config
      config.targets.forEach((target) => {
        const updates: any = {};

        target.propNames.forEach((propName) => {
          switch (propName) {
            case "radius":
              // Map volume to radius
              updates.radius = mapRange(volume, 0, 0.5, 20, 80);
              break;
            case "x":
              // Map bass/treble balance to X position
              const balance = bassLevel / (trebleLevel + 1);
              updates.x = mapRange(balance, 0.5, 2, 30, 70);
              break;
            case "y":
              // Map mid frequencies to Y position
              updates.y = mapRange(midLevel, 0, 255, 30, 70);
              break;
            case "opacity":
              // Map overall volume to opacity
              updates.opacity = mapRange(volume, 0, 0.5, 0.3, 1);
              break;
            case "tilt":
              // Map spectral centroid to tilt
              updates.tilt = mapRange(spectralCentroid, 0, 256, -45, 45);
              break;
            case "scale":
              // Map volume to scale
              updates.scale = mapRange(volume, 0, 0.5, 0.8, 1.2);
              break;
          }
        });

        // Apply updates to target object
        if (Object.keys(updates).length > 0) {
          target.obj(updates);
        }
      });

      animationFrameRef.current = requestAnimationFrame(() =>
        updateAnimation()
      );
    },
    [animatorEnabled, config]
  );

  // Initialize update loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      setAnimatorEnabled(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateAnimation]);

  return {
    animatorEnabled,
    setAnimatorEnabled,
  };
}

export { useAudioEffectAnimatorTestGenerated };
