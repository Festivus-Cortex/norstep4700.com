import { AudioConfig, AudioConfigDefaultSettings } from "./types";

/**
 * Fallback configuration with hardcoded music set structure.
 * Used if the API call fails or during SSR before client hydration.
 */
function getFallbackConfig(): AudioConfig {
  return {
    // FIXME: The fallback audio config currently includes no music sets. Just
    // in case the front end ever sees a config without sets then it needs to be
    // handled gracefully. It could happen if the API call fails
    musicSets: [],
    defaultSettings: getAudioConfigDefaultSettings(),
  };
}

/**
 * Get an object with default settings for the audio in the app. Controls
 * starting volume and panning.
 *
 * @returns An object with default settings for the audio in the app. Controls
 * starting volume and panning.
 */
export function getAudioConfigDefaultSettings(): AudioConfigDefaultSettings {
  return {
    masterVolume: 0.5625, // 0.5625 is .75 applied linearly
    trackVolume: 0.25, // 0.25 is 0.5 applied linearly
    trackPan: 0,
  };
}

/**
 * Fetches audio configuration from the server API.
 * The API dynamically scans the public/audio directory to discover music sets and tracks.
 *
 * Falls back to hardcoded config if the fetch fails.
 */
export async function getAudioConfig(): Promise<AudioConfig> {
  try {
    const response = await fetch("/api/audio-config");

    if (!response.ok) {
      throw new Error(`Failed to fetch audio config: ${response.statusText}`);
    }

    const config: AudioConfig = await response.json();
    return config;
  } catch (error) {
    console.warn(
      "Failed to fetch audio config from API, using fallback:",
      error
    );
    return getFallbackConfig();
  }
}

/**
 * Synchronous version that returns the fallback config immediately.
 * Use this if you need the config synchronously (e.g., during render).
 */
export function getAudioConfigSync(): AudioConfig {
  return getFallbackConfig();
}
