"use client";

import { useAudioContext } from "@/context/AudioContext";
import { setMasterVolume, pauseAudio, resumeAudio } from "@/app/audio/audio";
import { useEffect } from "react";

/**
 * Main hook for managing global audio operations.
 * Provides access to audio state and master controls.
 */
export function useAudioManager() {
  const context = useAudioContext();

  // Sync master volume with audio node when it changes
  useEffect(() => {
    let volume = context.masterVolume;
    if (context.isMasterMuted) {
      volume = 0;
    }
    setMasterVolume(volume);
  }, [context.masterVolume, context.isMasterMuted]);

  const toggleMasterMute = () => {
    context.setMasterMuted(!context.isMasterMuted);
  };

  const updateMasterVolume = (volume: number) => {
    context.setMasterVolume(volume);
  };

  const togglePlayPause = async () => {
    if (context.isPlaying) {
      await pauseAudio();
      context.setPlaying(false);
    } else {
      await resumeAudio();
      context.setPlaying(true);
    }
  };

  return {
    // State
    isInitialized: context.isInitialized,
    isMasterMuted: context.isMasterMuted,
    masterVolume: context.masterVolume,
    currentZone: context.currentSet,
    loadingZone: context.loadingSet,
    isPlaying: context.isPlaying,
    config: context.config,

    // Actions
    initializeAudio: context.initializeAudio,
    toggleMasterMute,
    togglePlayPause,
    updateMasterVolume,
    setMasterMuted: context.setMasterMuted,
    setPlaying: context.setPlaying,
  };
}
