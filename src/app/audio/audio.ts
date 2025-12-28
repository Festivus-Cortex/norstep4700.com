"use client";

import { Assert } from "@/utils/assert";
import { MusicTrackNodes } from "./types";

// Set up the audio context and support nodes for use throughout the site.

let audioCtx: AudioContext | undefined;
let audioRoot: GainNode | undefined;
let audioAnalyzer: AnalyserNode | undefined;
let audioError: Error | undefined;

try {
  audioCtx = new AudioContext();
  audioRoot = audioCtx.createGain();
  audioRoot.connect(audioCtx.destination);

  audioAnalyzer = audioCtx.createAnalyser();
  audioAnalyzer.fftSize = 1024;
  audioAnalyzer.connect(audioRoot);
} catch (error) {
  audioError = error as Error;
  console.warn(
    "Error setting up audio context. Is audio supported and allowed in this browser and device?",
    error
  );
}

/**
 * Sets the master volume.
 *
 * @param volume - Volume level (0-1)
 */
export function setMasterVolume(volume: number): void {
  Assert.exists(
    audioRoot,
    "setMasterVolume - Unable to set master volume without a "
  );
  audioRoot.gain.value = Math.max(0, Math.min(1, volume));
}

export { audioCtx, audioRoot, audioAnalyzer, audioError };
