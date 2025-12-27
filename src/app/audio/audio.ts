"use client";

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

export { audioCtx, audioRoot, audioAnalyzer, audioError };
