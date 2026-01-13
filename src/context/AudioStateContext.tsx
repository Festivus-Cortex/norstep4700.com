"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import {
  AudioState,
  AudioConfig,
  MusicTrackState,
  MusicSetData,
} from "@/app/audio/types";
import { getAudioConfig, getAudioConfigSync } from "@/app/audio/getAudioConfig";
import { initializeEffectConfig } from "@/effect/config/loader";
import {
  initializeAudioContext,
  closeAudioContext,
  getAudioError,
  getIsInitialized,
  pauseAudio,
  resumeAudio,
} from "@/app/audio/audio";
import { registerAnimators } from "@/effect/animators";

interface AudioStateContextType extends AudioState {
  config: AudioConfig;
  configError: Error | null;
  isEffectConfigInitialized: boolean;
  effectConfigError: Error | null;
  initializeAudio: () => void;
  setMasterMuted: (muted: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setCurrentMusicSet: (musicSetId: number | null) => void;
  setLoadingMusicSet: (musicSetId: number | null) => void;
  setLoadedMusicSet: (musicSetId: number, musicSetData: MusicSetData) => void;
  unloadMusicSet: (musicSetId: number) => void;
  setTracks: (tracks: MusicTrackState[]) => void;
  updateTrack: (trackId: string, updates: Partial<MusicTrackState>) => void;
  setPlaying: (playing: boolean) => void;
}

const AudioStateContext = createContext<AudioStateContextType | undefined>(
  undefined
);

export function AudioStateProvider({ children }: { children: ReactNode }) {
  // Start with sync fallback config, will be updated with API data
  const [config, setConfig] = useState<AudioConfig>(getAudioConfigSync());
  const [configError, setConfigError] = useState<Error | null>(null);
  const [isEffectConfigInitialized, setIsEffectConfigInitialized] =
    useState(false);
  const [effectConfigError, setEffectConfigError] = useState<Error | null>(
    null
  );

  // Fetch actual config from API on mount
  useEffect(() => {
    getAudioConfig()
      .then((apiConfig) => {
        setConfig(apiConfig);
        setConfigError(null);
      })
      .catch((error) => {
        console.error("Failed to load audio config:", error);
        setConfigError(
          error instanceof Error
            ? error
            : new Error("Failed to load audio configuration")
        );
      });
  }, []);

  // Register animators and initialize effect config on mount (before any effects are created)
  useEffect(() => {
    // Explicitly register all animators with the EffectRegistry
    registerAnimators();

    initializeEffectConfig()
      .then(() => {
        setIsEffectConfigInitialized(true);
        setEffectConfigError(null);
      })
      .catch((error) => {
        console.error("Failed to initialize effect config:", error);
        setEffectConfigError(
          error instanceof Error
            ? error
            : new Error("Failed to initialize effect configuration")
        );
      });
  }, []);

  // Initialize state
  const [state, setState] = useState<AudioState>({
    isInitialized: false,
    audioError: null,
    isMasterMuted: false, // Default to unmuted
    masterVolume: config.defaultSettings.masterVolume,
    currentSet: null,
    loadingSet: null,
    loadedSets: new Map<number, MusicSetData>(),
    tracks: [],
    isPlaying: false,
  });

  const initializeAudio = useCallback(async () => {
    try {
      await initializeAudioContext();
      const initialized = getIsInitialized();
      const error = getAudioError();
      setState((prev) => ({
        ...prev,
        isInitialized: initialized,
        audioError: error,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isInitialized: false,
        audioError: error as Error,
      }));
    }
  }, []);

  const setMasterMuted = useCallback((muted: boolean) => {
    setState((prev) => ({ ...prev, isMasterMuted: muted }));
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, masterVolume: volume }));
  }, []);

  const setCurrentMusicSet = useCallback((musicSetId: number | null) => {
    setState((prev) => ({ ...prev, currentSet: musicSetId }));
  }, []);

  const setLoadingMusicSet = useCallback((musicSetId: number | null) => {
    setState((prev) => ({ ...prev, loadingSet: musicSetId }));
  }, []);

  const setLoadedMusicSet = useCallback(
    (musicSetId: number, musicSetData: MusicSetData) => {
      setState((prev) => {
        const newLoadedSets = new Map(prev.loadedSets);
        newLoadedSets.set(musicSetId, musicSetData);
        return { ...prev, loadedSets: newLoadedSets };
      });
    },
    []
  );

  const unloadMusicSet = useCallback((musicSetId: number) => {
    setState((prev) => {
      const newLoadedSets = new Map(prev.loadedSets);
      newLoadedSets.delete(musicSetId);
      return { ...prev, loadedSets: newLoadedSets };
    });
  }, []);

  const setTracks = useCallback((tracks: MusicTrackState[]) => {
    setState((prev) => ({ ...prev, tracks }));
  }, []);

  const updateTrack = useCallback(
    (trackId: string, updates: Partial<MusicTrackState>) => {
      setState((prev) => ({
        ...prev,
        tracks: prev.tracks.map((track) =>
          track.id === trackId ? { ...track, ...updates } : track
        ),
      }));
    },
    []
  );

  const setPlaying = useCallback((playing: boolean) => {
    setState((prev) => ({ ...prev, isPlaying: playing }));
  }, []);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      closeAudioContext();
    };
  }, []);

  // Page Visibility API integration for auto-pause/resume
  useEffect(() => {
    if (!state.isInitialized) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Tab is hidden - pause if playing
        if (state.isPlaying) {
          await pauseAudio();
        }
      } else {
        // Tab is visible - resume if was playing
        if (state.isPlaying) {
          await resumeAudio();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.isInitialized, state.isPlaying]);

  const value: AudioStateContextType = {
    ...state,
    config,
    configError,
    isEffectConfigInitialized,
    effectConfigError,
    initializeAudio,
    setMasterMuted,
    setMasterVolume,
    setCurrentMusicSet,
    setLoadingMusicSet,
    setLoadedMusicSet,
    unloadMusicSet,
    setTracks,
    updateTrack,
    setPlaying,
  };

  return (
    <AudioStateContext.Provider value={value}>
      {children}
    </AudioStateContext.Provider>
  );
}

export function useAudioState(): AudioStateContextType {
  const context = useContext(AudioStateContext);
  if (!context) {
    throw new Error("useAudioState must be used within AudioStateProvider");
  }
  return context;
}
