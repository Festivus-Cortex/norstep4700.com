"use client";

// Set up the audio context and support nodes for use throughout the site.
const audioCtx = new AudioContext();
const audioRoot = audioCtx.createGain();
audioRoot.connect(audioCtx.destination);

export { audioCtx, audioRoot };
