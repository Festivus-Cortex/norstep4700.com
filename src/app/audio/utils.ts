// FIXME: Verify functionality and comment better.

import { getAudioAnalyzer } from "@/app/audio/audio";

// Audio analysis utilities
export const getFrequencyData = () => {
  const audioAnalyzer = getAudioAnalyzer();
  if (!audioAnalyzer) {
    throw new Error(
      "getFrequencyData - No audio analyzer node found. Audio not initialized."
    );
  }
  const dataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
  audioAnalyzer.getByteFrequencyData(dataArray);
  return dataArray;
};

export const getTimeDomainData = () => {
  const audioAnalyzer = getAudioAnalyzer();
  if (!audioAnalyzer) {
    throw new Error(
      "getTimeDomainData - No audio analyzer node found. Audio not initialized."
    );
  }
  const dataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
  audioAnalyzer.getByteTimeDomainData(dataArray);
  return dataArray;
};

// Calculate RMS (Root Mean Square) for overall volume
export const calculateRMS = (timeDomainData: Uint8Array): number => {
  let sum = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    const sample = (timeDomainData[i] - 128) / 128; // Convert to -1 to 1 range
    sum += sample * sample;
  }
  return Math.sqrt(sum / timeDomainData.length);
};

// Calculate spectral centroid (brightness)
export const calculateSpectralCentroid = (
  frequencyData: Uint8Array
): number => {
  let weightedSum = 0;
  let sum = 0;

  for (let i = 0; i < frequencyData.length; i++) {
    weightedSum += frequencyData[i] * i;
    sum += frequencyData[i];
  }

  return sum > 0 ? weightedSum / sum : 0;
};

// Get average magnitude for a frequency band
export const getFrequencyBand = (
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
