"use client";

import { Assert } from "@/utils/assert";
import { audioCtx } from "./audio";

/**
 * Loads an audio buffer from URL.
 *
 * @param url URL pointing to audio files to load
 * @returns Promise that resolves to an AudioBuffer object
 */
const loadAudioBuffer = (url: string): Promise<AudioBuffer> => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = () => {
      Assert.exists(
        audioCtx,
        "loadAudioBuffer - cannot complete loading audio buffer. No audio context exists to decode."
      );
      audioCtx.decodeAudioData(
        request.response,
        (buffer) => resolve(buffer),
        (error) => reject(new Error(`Error decoding audio data: ${error}`))
      );
    };

    request.onerror = () => {
      reject(
        new Error(
          `loadAudioBuffer - Audio file loading failed. The url of ${url} could not be loaded.`
        )
      );
    };

    request.send();
  });
};

/**
 * Loads multiple audio buffers from an array of URLs.
 *
 * @param urls - Array of URLs pointing to audio files to load
 * @returns Promise that resolves to an array of AudioBuffer objects
 */
const loadMultipleAudioBuffers = (urls: string[]): Promise<AudioBuffer[]> => {
  const bufferPromises = urls.map((url) => loadAudioBuffer(url));
  return Promise.all(bufferPromises);
};

export { loadAudioBuffer, loadMultipleAudioBuffers };
