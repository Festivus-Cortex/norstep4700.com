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
} from "@/app/audio/audioTypes";
import { getAudioConfig, getAudioConfigSync } from "@/app/audio/audioScanner";

interface AudioContextType extends AudioState {
  config: AudioConfig;
  initializeAudio: () => void;
  setMasterMuted: (muted: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setCurrentZone: (zoneId: number | null) => void;
  setLoadingZone: (zoneId: number | null) => void;
  setLoadedZone: (zoneId: number, zoneData: MusicSetData) => void;
  unloadZone: (zoneId: number) => void;
  setTracks: (tracks: MusicTrackState[]) => void;
  updateTrack: (trackId: string, updates: Partial<MusicTrackState>) => void;
  setPlaying: (playing: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioContextProvider({ children }: { children: ReactNode }) {
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
    isMasterMuted: true, // Default to muted
    masterVolume: config.defaultSettings.masterVolume,
    currentZone: null,
    loadingZone: null,
    loadedZones: new Map<number, MusicSetData>(),
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

  const setCurrentZone = useCallback((zoneId: number | null) => {
    setState((prev) => ({ ...prev, currentZone: zoneId }));
  }, []);

  const setLoadingZone = useCallback((zoneId: number | null) => {
    setState((prev) => ({ ...prev, loadingZone: zoneId }));
  }, []);

  const setLoadedZone = useCallback(
    (zoneId: number, zoneData: MusicSetData) => {
      setState((prev) => {
        const newLoadedZones = new Map(prev.loadedZones);
        newLoadedZones.set(zoneId, zoneData);
        return { ...prev, loadedZones: newLoadedZones };
      });
    },
    []
  );

  const unloadZone = useCallback((zoneId: number) => {
    setState((prev) => {
      const newLoadedZones = new Map(prev.loadedZones);
      newLoadedZones.delete(zoneId);
      return { ...prev, loadedZones: newLoadedZones };
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

  const value: AudioContextType = {
    ...state,
    config,
    initializeAudio,
    setMasterMuted,
    setMasterVolume,
    setCurrentZone,
    setLoadingZone,
    setLoadedZone,
    unloadZone,
    setTracks,
    updateTrack,
    setPlaying,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudioContext(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioContext must be used within AudioContextProvider");
  }
  return context;
}
