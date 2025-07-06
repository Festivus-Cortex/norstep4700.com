"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { AudioEffectAnimatorConfig } from "./audioEffectAnimatorConfig";
import { audioAnalyzer } from "@/app/audio/audio";

// FIXME: Generated content updates from ai agent. some of this is potentially
// useful but needs migrated. Storing as a copy for now.

// Audio analysis utilities
const getFrequencyData = () => {
  const dataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
  audioAnalyzer.getByteFrequencyData(dataArray);
  return dataArray;
};

const getTimeDomainData = () => {
  const dataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
  audioAnalyzer.getByteTimeDomainData(dataArray);
  return dataArray;
};

// Calculate RMS (Root Mean Square) for overall volume
const calculateRMS = (timeDomainData: Uint8Array): number => {
  let sum = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    const sample = (timeDomainData[i] - 128) / 128; // Convert to -1 to 1 range
    sum += sample * sample;
  }
  return Math.sqrt(sum / timeDomainData.length);
};

// Get average magnitude for a frequency band
const getFrequencyBand = (
  frequencyData: Uint8Array,
  startBin: number,
  endBin: number
): number => {
  let sum = 0;
  for (let i = startBin; i <= endBin && i < frequencyData.length; i++) {
    sum += frequencyData[i];
  }
  return sum / (endBin - startBin + 1);
};

// Map a value from one range to another
const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
};

// Calculate spectral centroid (brightness)
const calculateSpectralCentroid = (frequencyData: Uint8Array): number => {
  let weightedSum = 0;
  let sum = 0;

  for (let i = 0; i < frequencyData.length; i++) {
    weightedSum += frequencyData[i] * i;
    sum += frequencyData[i];
  }

  return sum > 0 ? weightedSum / sum : 0;
};

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

      // Calculate audio properties
      const volume = calculateRMS(timeDomainData);
      const bassLevel = getFrequencyBand(frequencyData, 0, 5); // 20-250 Hz
      const midLevel = getFrequencyBand(frequencyData, 11, 40); // 500-2000 Hz
      const trebleLevel = getFrequencyBand(frequencyData, 81, 200); // 4-10 kHz
      const spectralCentroid = calculateSpectralCentroid(frequencyData);

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
    // Export utility functions for external use
    getFrequencyData,
    getTimeDomainData,
    calculateRMS,
    getFrequencyBand,
    mapRange,
    calculateSpectralCentroid,
  };
}

export { useAudioEffectAnimatorTestGenerated };
