"use client";

import { useAudioContext } from "@/context/AudioContext";
import { audioAnalyzer } from "@/app/audio/audio";
import { useCallback } from "react";

/**
 * Hook for accessing audio analyzer data for animations.
 * Provides frequency and time-domain data from the AnalyserNode.
 */
export function useAudioAnalyzer() {
  const context = useAudioContext();

  /**
   * Gets the current frequency data from the analyzer.
   * Returns Uint8Array with frequency magnitude values (0-255).
   */
  const getFrequencyData = useCallback(() => {
    const dataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
    audioAnalyzer.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  /**
   * Gets the current time-domain data from the analyzer.
   * Returns Uint8Array with waveform values (0-255).
   */
  const getTimeDomainData = useCallback(() => {
    const dataArray = new Uint8Array(audioAnalyzer.fftSize);
    audioAnalyzer.getByteTimeDomainData(dataArray);
    return dataArray;
  }, []);

  /**
   * Gets a specific frequency band's average magnitude.
   *
   * @param startBin - Starting frequency bin index
   * @param endBin - Ending frequency bin index
   * @returns Average magnitude (0-255)
   */
  const getFrequencyBand = useCallback(
    (startBin: number, endBin: number) => {
      const frequencyData = getFrequencyData();
      let sum = 0;
      let count = 0;

      for (let i = startBin; i <= endBin && i < frequencyData.length; i++) {
        sum += frequencyData[i];
        count++;
      }

      return count > 0 ? sum / count : 0;
    },
    [getFrequencyData]
  );

  /**
   * Calculates RMS (Root Mean Square) for volume/amplitude.
   *
   * @returns RMS value (0-1)
   */
  const calculateRMS = useCallback(() => {
    const timeDomainData = getTimeDomainData();
    let sum = 0;

    for (let i = 0; i < timeDomainData.length; i++) {
      const normalized = (timeDomainData[i] - 128) / 128; // Normalize to -1 to 1
      sum += normalized * normalized;
    }

    return Math.sqrt(sum / timeDomainData.length);
  }, [getTimeDomainData]);

  return {
    analyzerNode: audioAnalyzer,
    isPlaying: context.isPlaying,
    getFrequencyData,
    getTimeDomainData,
    getFrequencyBand,
    calculateRMS,
  };
}
