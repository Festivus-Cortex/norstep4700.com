"use client";

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
let isInitializing = false;
let isInitialized = false;

/**
 * Initializes the audio context lazily on first user interaction.
 * Guards against concurrent initialization attempts.
 */
export async function initializeAudioContext(): Promise<void> {
  // Guard against multiple initialization
  if (isInitialized || isInitializing) return;
  if (typeof window === "undefined") return; // SSR guard

  isInitializing = true;

  try {
    // Establish a new audio context and analyzer
    audioCtx = new AudioContext();
    audioRoot = audioCtx.createGain();
    audioRoot.connect(audioCtx.destination);
    audioRoot.gain.value = 0.75;

    audioAnalyzer = audioCtx.createAnalyser();
    audioAnalyzer.fftSize = 1024;
    audioAnalyzer.connect(audioRoot);

    isInitialized = true;
    audioError = undefined;
  } catch (error) {
    audioError = error as Error;
    console.warn(
      "Error initializing audio context. Is audio supported and allowed in this browser and device?",
      error
    );
  } finally {
    isInitializing = false;
  }
}

/**
 * Closes the audio context and releases resources.
 */
export async function closeAudioContext(): Promise<void> {
  if (!audioCtx) return;

  try {
    await audioCtx.close();
  } catch (error) {
    console.warn("Error closing audio context:", error);
  } finally {
    audioCtx = undefined;
    audioRoot = undefined;
    audioAnalyzer = undefined;
    isInitialized = false;
  }
}

/**
 * Gets the current audio context.
 * @returns AudioContext instance or null if not initialized
 */
export function getAudioContext(): AudioContext | null {
  return audioCtx ?? null;
}

/**
 * Gets the master gain node.
 * @returns GainNode instance or null if not initialized
 */
export function getAudioRoot(): GainNode | null {
  return audioRoot ?? null;
}

/**
 * Gets the audio analyzer node.
 * @returns AnalyserNode instance or null if not initialized
 */
export function getAudioAnalyzer(): AnalyserNode | null {
  return audioAnalyzer ?? null;
}

/**
 * Gets any error that occurred during audio initialization.
 * @returns Error instance or null if no error
 */
export function getAudioError(): Error | null {
  return audioError ?? null;
}

/**
 * Checks if the audio context has been successfully initialized.
 * @returns true if audio context is initialized and ready to use
 */
export function getIsInitialized(): boolean {
  return isInitialized;
}

/**
 * Sets the master volume.
 *
 * @param volume - Linear volume level (0-1)
 */
export function setMasterVolume(volume: number): void {
  if (!audioRoot) {
    console.warn(
      "Audio context not initialized, cannot set volume. Initialize audio first."
    );
    return;
  }
  const gain = linearToGain(Math.max(0, Math.min(1, volume)));
  audioRoot.gain.value = gain;
}

/**
 * Pauses audio playback by suspending the audio context.
 */
export async function pauseAudio(): Promise<void> {
  if (!audioCtx) {
    console.warn(
      "Audio context not initialized, cannot pause. Initialize audio first."
    );
    return;
  }
  if (audioCtx.state === "running") {
    await audioCtx.suspend();
  }
}

/**
 * Resumes audio playback by resuming the audio context.
 */
export async function resumeAudio(): Promise<void> {
  if (!audioCtx) {
    console.warn(
      "Audio context not initialized, cannot resume. Initialize audio first."
    );
    return;
  }
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
}

// Legacy exports for backward compatibility
// These will be removed after migration is complete
export { audioCtx, audioRoot, audioAnalyzer, audioError };
