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

interface AudioStateContextType extends AudioState {
  config: AudioConfig;
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

const AudioStateContext = createContext<AudioStateContextType | undefined>(undefined);

export function AudioStateProvider({ children }: { children: ReactNode }) {
  // Start with sync fallback config, will be updated with API data
  const [config, setConfig] = useState<AudioConfig>(getAudioConfigSync());

  // Fetch actual config from API on mount
  useEffect(() => {
    getAudioConfig().then((apiConfig) => {
      setConfig(apiConfig);
    });
  }, []);

  // Initialize state
  const [state, setState] = useState<AudioState>({
    isInitialized: false,
    isMasterMuted: false, // Default to unmuted
    masterVolume: config.defaultSettings.masterVolume,
    currentSet: null,
    loadingSet: null,
    loadedSets: new Map<number, MusicSetData>(),
    tracks: [],
    isPlaying: false,
  });

  const initializeAudio = useCallback(() => {
    setState((prev) => ({ ...prev, isInitialized: true }));
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

  const value: AudioStateContextType = {
    ...state,
    config,
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
    <AudioStateContext.Provider value={value}>{children}</AudioStateContext.Provider>
  );
}

export function useAudioState(): AudioStateContextType {
  const context = useContext(AudioStateContext);
  if (!context) {
    throw new Error("useAudioState must be used within AudioStateProvider");
  }
  return context;
}
