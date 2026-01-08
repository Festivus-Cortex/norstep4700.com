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
  private frequencyBuffer: Uint8Array<ArrayBuffer>;
  /** Buffer for time domain (waveform) data */
  private timeDomainBuffer: Uint8Array<ArrayBuffer>;
  /** Map of track IDs to their analyzer nodes */
  private trackAnalyzers: Map<string, AnalyserNode> = new Map();

  private constructor() {
    // Initialize buffers based on analyzer config or defaults
    const frequencyBinCount = audioAnalyzer?.frequencyBinCount ?? 512;
    const fftSize = audioAnalyzer?.fftSize ?? 1024;

    // Create buffers with explicit ArrayBuffer (not SharedArrayBuffer)
    this.frequencyBuffer = new Uint8Array(new ArrayBuffer(frequencyBinCount));
    this.timeDomainBuffer = new Uint8Array(new ArrayBuffer(fftSize));
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
    audioAnalyzer.getByteFrequencyData(this.frequencyBuffer);
    audioAnalyzer.getByteTimeDomainData(this.timeDomainBuffer);

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

  /**
   * Register a per-track analyzer node.
   *
   * @param trackId - Unique track identifier
   * @param analyzer - AnalyserNode for this track
   */
  registerTrackAnalyzer(trackId: string, analyzer: AnalyserNode): void {
    this.trackAnalyzers.set(trackId, analyzer);
  }

  /**
   * Unregister a per-track analyzer node.
   *
   * @param trackId - Track identifier to remove
   */
  unregisterTrackAnalyzer(trackId: string): void {
    this.trackAnalyzers.delete(trackId);
  }

  /**
   * Get audio data for a specific track.
   * Returns empty data if track analyzer is not registered.
   *
   * @param trackId - Track identifier
   * @returns AudioFrameData for the specific track
   */
  getTrackFrameData(trackId: string): AudioFrameData {
    const analyzer = this.trackAnalyzers.get(trackId);
    if (!analyzer) {
      return this.getEmptyFrameData();
    }

    // Reuse global buffers (safe since single-threaded)
    analyzer.getByteFrequencyData(this.frequencyBuffer);
    analyzer.getByteTimeDomainData(this.timeDomainBuffer);

    // FIXME: make values configurable
    // Compute metrics
    const rms = this.computeRMS();
    const bass = this.getBandAverage(0, 10);
    const midLow = this.getBandAverage(11, 40);
    const midHigh = this.getBandAverage(41, 80);
    const treble = this.getBandAverage(81, 511);

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
}

/**
 * Public API for AudioDataProvider.
 */
export const AudioDataProvider = {
  getInstance: () => AudioDataProviderImpl.getInstance(),
  getFrameData: () => AudioDataProviderImpl.getInstance().getFrameData(),
  getTrackFrameData: (trackId: string) =>
    AudioDataProviderImpl.getInstance().getTrackFrameData(trackId),
  registerTrackAnalyzer: (trackId: string, analyzer: AnalyserNode) =>
    AudioDataProviderImpl.getInstance().registerTrackAnalyzer(
      trackId,
      analyzer
    ),
  unregisterTrackAnalyzer: (trackId: string) =>
    AudioDataProviderImpl.getInstance().unregisterTrackAnalyzer(trackId),
  isAvailable: () => AudioDataProviderImpl.getInstance().isAvailable(),
};
