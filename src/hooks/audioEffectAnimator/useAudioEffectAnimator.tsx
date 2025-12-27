"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { AudioEffectAnimatorConfig } from "./audioEffectAnimatorConfig";
import { useAudioAnalyzer } from "@/hooks/audio/useAudioAnalyzer";

function useAudioEffectAnimator(config: AudioEffectAnimatorConfig) {
  const [animatorEnabled, setAnimatorEnabled] = useState(true);
  const { isPlaying, getFrequencyData, calculateRMS } = useAudioAnalyzer();
  const animationFrameRef = useRef<number>(0);

  const updateAnimation = useCallback(() => {
    if (!animatorEnabled || !isPlaying) {
      return;
    }

    // Get audio data
    const frequencyData = getFrequencyData();
    const rms = calculateRMS();

    // FIXME: Clean up generated mapping
    // Map audio properties to visual effects based on config
    config.targets.forEach((target) => {
      const updates: any = {};

      target.propNames.forEach((propName) => {
        switch (propName) {
          case "radius":
            // Map RMS (volume) to radius (20-80 range)
            updates.radius = mapRange(rms, 0, 0.5, 20, 80);
            break;
          case "x":
            // Map bass frequencies to X position
            const bassLevel = getFrequencyBand(frequencyData, 0, 5);
            updates.x = mapRange(bassLevel, 0, 255, 30, 70);
            break;
          case "y":
            // Map mid frequencies to Y position
            const midLevel = getFrequencyBand(frequencyData, 11, 40);
            updates.y = mapRange(midLevel, 0, 255, 30, 70);
            break;
          case "opacity":
            // Map volume to opacity
            updates.opacity = mapRange(rms, 0, 0.5, 0.3, 1);
            break;
          case "tilt":
            // Map high frequencies to tilt
            const trebleLevel = getFrequencyBand(frequencyData, 81, 200);
            updates.tilt = mapRange(trebleLevel, 0, 255, -45, 45);
            break;
          case "scale":
            // Map volume to scale
            updates.scale = mapRange(rms, 0, 0.5, 0.8, 1.2);
            break;
        }
      });

      // Apply updates to target using callback
      if (Object.keys(updates).length > 0 && typeof target.obj === "function") {
        target.obj((prev: any) => ({ ...prev, ...updates }));
      }
    });

    animationFrameRef.current = requestAnimationFrame(updateAnimation);
  }, [animatorEnabled, isPlaying, getFrequencyData, calculateRMS, config]);

  // Initialize update loop
  useEffect(() => {
    if (animatorEnabled && isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateAnimation);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animatorEnabled, isPlaying, updateAnimation]);

  return { animatorEnabled, setAnimatorEnabled };
}

// Helper function to get frequency band average
function getFrequencyBand(
  frequencyData: Uint8Array,
  startBin: number,
  endBin: number
): number {
  let sum = 0;
  let count = 0;

  for (let i = startBin; i <= endBin && i < frequencyData.length; i++) {
    sum += frequencyData[i];
    count++;
  }

  return count > 0 ? sum / count : 0;
}

// Helper function to map ranges
function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

export { useAudioEffectAnimator };
