"use client";

import { audioCtx } from "./audio";

// FIXME: Verify this function right - Load audio based on content sources
const loadAudioBuffer = (url: string): Promise<AudioBuffer> => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = () => {
      audioCtx.decodeAudioData(
        request.response,
        (buffer) => resolve(buffer),
        (error) => reject(new Error(`Error decoding audio data: ${error}`))
      );
    };

    request.onerror = () => {
      reject(
        new Error(
          `Audio file loading failed. The url of ${url} could not be loaded.`
        )
      );
    };

    request.send();
  });
};

// FIXME: Verify this function works right
const loadMultipleAudioBuffers = (urls: string[]): Promise<AudioBuffer[]> => {
  const bufferPromises = urls.map((url) => loadAudioBuffer(url));
  return Promise.all(bufferPromises);
};

export { loadAudioBuffer, loadMultipleAudioBuffers };
