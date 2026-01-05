"use client";

import { Assert } from "@/utils/assert";

/**
 * Converts a linear volume value (0-1) to a perceptually linear gain value.
 * Human perception of loudness is logarithmic, so we square the linear value
 * to make volume changes feel more natural.
 *
 * @param linearValue - Linear volume value from 0 to 1
 * @returns Gain value adjusted for human perception
 */
export function linearToGain(linearValue: number): number {
  return linearValue * linearValue;
}

// Audio context and support nodes for use throughout the site.
let audioCtx: AudioContext | undefined;
let audioRoot: GainNode | undefined;
let audioAnalyzer: AnalyserNode | undefined;
let audioError: Error | undefined;

// Only initialize audio context in the browser (not during SSR)
if (typeof window !== "undefined") {
  try {
    // Establish a new audio context and analyzer if possible/
    audioCtx = new AudioContext();
    audioRoot = audioCtx.createGain();
    audioRoot.connect(audioCtx.destination);
    audioRoot.gain.value = 0.75;

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
}

/**
 * Sets the master volume.
 *
 * @param volume - Linear volume level (0-1)
 */
export function setMasterVolume(volume: number): void {
  Assert.exists(
    audioRoot,
    "setMasterVolume - Unable to set master volume without a valid root audio gain node."
  );
  const gain = linearToGain(Math.max(0, Math.min(1, volume)));
  audioRoot.gain.value = gain;
}

/**
 * Pauses audio playback by suspending the audio context.
 */
export async function pauseAudio(): Promise<void> {
  Assert.exists(
    audioCtx,
    "pauseAudio - Unable to pause audio without an audio context"
  );
  if (audioCtx.state === "running") {
    await audioCtx.suspend();
  }
}

/**
 * Resumes audio playback by resuming the audio context.
 */
export async function resumeAudio(): Promise<void> {
  Assert.exists(
    audioCtx,
    "resumeAudio - Unable to resume audio without an audio context"
  );
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
}

export { audioCtx, audioRoot, audioAnalyzer, audioError };
