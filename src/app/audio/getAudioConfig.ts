import { AudioConfig } from "./types";

/**
 * Fallback configuration with hardcoded zone structure.
 * Used if the API call fails or during SSR before client hydration.
 */
function getFallbackConfig(): AudioConfig {
  return {
    musicSets: [],
    defaultSettings: {
      masterVolume: 0.7,
      trackVolume: 0.8,
      trackPan: 0,
    },
  };
}

/**
 * Fetches audio configuration from the server API.
 * The API dynamically scans the public/audio directory to discover zones and tracks.
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
