/**
 * Bridge between the effect system and the existing audio infrastructure.
 *
 * Provides pre-computed audio analysis data for each frame, optimizing
 * for performance by computing frequency bands once per frame rather
 * than per-effect.
 */

import { audioAnalyzer } from "@/app/audio/audio";
import { AudioFrameData } from "./types";

/**
 * AudioDataProvider singleton.
 *
 * Efficiently provides audio analysis data by:
 * - Reusing typed arrays across frames
 * - Computing frequency bands once per frame
 * - Handling missing/unavailable audio gracefully
 */
class AudioDataProviderImpl {
  private static instance: AudioDataProviderImpl | null = null;

  /** Buffer for frequency data */
  private frequencyBuffer: Uint8Array;
  /** Buffer for time domain (waveform) data */
  private timeDomainBuffer: Uint8Array;

  private constructor() {
    // Initialize buffers based on analyzer config or defaults
    const frequencyBinCount = audioAnalyzer?.frequencyBinCount ?? 512;
    const fftSize = audioAnalyzer?.fftSize ?? 1024;

    this.frequencyBuffer = new Uint8Array(frequencyBinCount);
    this.timeDomainBuffer = new Uint8Array(fftSize);
  }

  static getInstance(): AudioDataProviderImpl {
    if (!AudioDataProviderImpl.instance) {
      AudioDataProviderImpl.instance = new AudioDataProviderImpl();
    }
    return AudioDataProviderImpl.instance;
  }

  /**
   * Get complete audio frame data for the current moment.
   * All frequency bands are pre-computed for efficiency.
   */
  getFrameData(): AudioFrameData {
    if (!audioAnalyzer) {
      return this.getEmptyFrameData();
    }

    // Fill buffers with current audio data
    // Type assertion needed due to Uint8Array generic parameter mismatch
    audioAnalyzer.getByteFrequencyData(
      this.frequencyBuffer as unknown as Uint8Array<ArrayBuffer>
    );
    audioAnalyzer.getByteTimeDomainData(
      this.timeDomainBuffer as unknown as Uint8Array<ArrayBuffer>
    );

    // Compute metrics
    const rms = this.computeRMS();
    const bass = this.getBandAverage(0, 10);
    const midLow = this.getBandAverage(11, 40);
    const midHigh = this.getBandAverage(41, 80);
    const treble = this.getBandAverage(81, 200);

    return {
      frequencyData: this.frequencyBuffer,
      timeDomainData: this.timeDomainBuffer,
      rms,
      bass,
      midLow,
      midHigh,
      treble,
      timestamp: performance.now(),
    };
  }

  /**
   * Compute Root Mean Square from time domain data.
   * Returns a value from 0 to 1 representing overall volume.
   */
  private computeRMS(): number {
    let sum = 0;
    const length = this.timeDomainBuffer.length;

    for (let i = 0; i < length; i++) {
      // Time domain data is 0-255, centered at 128
      const normalized = (this.timeDomainBuffer[i] - 128) / 128;
      sum += normalized * normalized;
    }

    return Math.sqrt(sum / length);
  }

  /**
   * Get average value for a frequency band range.
   * Returns a value from 0 to 255.
   *
   * @param startBin - Starting frequency bin (inclusive)
   * @param endBin - Ending frequency bin (inclusive)
   */
  private getBandAverage(startBin: number, endBin: number): number {
    const actualEnd = Math.min(endBin, this.frequencyBuffer.length - 1);
    const actualStart = Math.max(startBin, 0);

    if (actualStart > actualEnd) {
      return 0;
    }

    let sum = 0;
    for (let i = actualStart; i <= actualEnd; i++) {
      sum += this.frequencyBuffer[i];
    }

    return sum / (actualEnd - actualStart + 1);
  }

  /**
   * Get empty frame data when audio is not available.
   */
  private getEmptyFrameData(): AudioFrameData {
    return {
      frequencyData: this.frequencyBuffer, // Already zeroed
      timeDomainData: this.timeDomainBuffer,
      rms: 0,
      bass: 0,
      midLow: 0,
      midHigh: 0,
      treble: 0,
      timestamp: performance.now(),
    };
  }

  /**
   * Check if audio analysis is available.
   */
  isAvailable(): boolean {
    return audioAnalyzer !== undefined;
  }
}

/**
 * Public API for AudioDataProvider.
 */
export const AudioDataProvider = {
  getInstance: () => AudioDataProviderImpl.getInstance(),
  getFrameData: () => AudioDataProviderImpl.getInstance().getFrameData(),
  isAvailable: () => AudioDataProviderImpl.getInstance().isAvailable(),
};
