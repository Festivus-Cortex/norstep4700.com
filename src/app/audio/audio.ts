"use client";

// Set up the audio context and support nodes for use throughout the site.
const audioCtx = new AudioContext();
const audioRoot = audioCtx.createGain();
audioRoot.connect(audioCtx.destination);

const audioAnalyzer = audioCtx.createAnalyser();
audioAnalyzer.fftSize = 1024;
audioAnalyzer.connect(audioRoot);

export { audioCtx, audioRoot, audioAnalyzer };
