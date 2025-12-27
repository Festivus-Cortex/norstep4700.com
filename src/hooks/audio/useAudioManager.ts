"use client";

import { useAudioContext } from "@/context/AudioContext";
import { setMasterVolume as setMasterVolumeNode } from "@/app/audio/audioNodes";
import { audioRoot } from "@/app/audio/audio";
import { useEffect } from "react";

/**
 * Main hook for managing global audio operations.
 * Provides access to audio state and master controls.
 */
export function useAudioManager() {
  const context = useAudioContext();

  // Sync master volume with audio node when it changes
  useEffect(() => {
    if (context.isMasterMuted) {
      audioRoot.gain.value = 0;
    } else {
      setMasterVolumeNode(context.masterVolume);
    }
  }, [context.masterVolume, context.isMasterMuted]);

  const toggleMasterMute = () => {
    context.setMasterMuted(!context.isMasterMuted);
  };

  const updateMasterVolume = (volume: number) => {
    context.setMasterVolume(volume);
  };

  return {
    // State
    isInitialized: context.isInitialized,
    isMasterMuted: context.isMasterMuted,
    masterVolume: context.masterVolume,
    currentZone: context.currentZone,
    loadingZone: context.loadingZone,
    isPlaying: context.isPlaying,
    config: context.config,

    // Actions
    initializeAudio: context.initializeAudio,
    toggleMasterMute,
    updateMasterVolume,
    setMasterMuted: context.setMasterMuted,
    setPlaying: context.setPlaying,
  };
}
