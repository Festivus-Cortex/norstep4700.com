"use client";

import { useCallback } from "react";
import { useAudioState } from "@/context/AudioStateContext";
import { loadMultipleAudioBuffers } from "@/app/audio/loader";
import { createTrackNodes, startTrack, stopTrack } from "@/app/audio/tracks";
import { MusicTrackState, MusicSetData } from "@/app/audio/types";
import {
  createMusicSetNode,
  disconnectMusicSetNodes,
  fadeInMusicSet,
} from "@/app/audio/musicSet";
import { AudioDataProvider } from "@/effect/core/AudioDataProvider";

/**
 * Hook for managing music set loading, switching, and cleanup.
 */
export function useAudioMusicSet() {
  const context = useAudioState();

  /**
   * Loads a music set's audio buffers and creates Web Audio nodes.
   */
  const loadMusicSet = useCallback(
    async (musicSetId: number) => {
      const musicSet = context.config.musicSets.find(
        (ms) => ms.id === musicSetId
      );
      if (!musicSet) {
        console.error(`Music set ${musicSetId} not found`);
        return;
      }

      context.setLoadingMusicSet(musicSetId);

      try {
        // Load all track buffers for this music set
        const trackPaths = musicSet.tracks.map((track) => track.path);
        const buffers = await loadMultipleAudioBuffers(trackPaths);

        // Create music set node
        const musicSetNode = createMusicSetNode();

        // Create nodes for each track
        const trackNodes = buffers.map((buffer, index) => {
          return createTrackNodes(
            buffer,
            musicSetNode,
            context.config.defaultSettings.trackVolume,
            context.config.defaultSettings.trackPan,
            true // loop
          );
        });

        // Build track analyzers map and register with AudioDataProvider
        const trackAnalyzers = new Map<string, AnalyserNode>();
        trackNodes.forEach((nodes, index) => {
          const trackId = musicSet.tracks[index].id;
          trackAnalyzers.set(trackId, nodes.analyzer);
          AudioDataProvider.registerTrackAnalyzer(trackId, nodes.analyzer);
        });

        // Store music set data
        const musicSetData: MusicSetData = {
          setId: musicSetId,
          buffers,
          nodes: trackNodes,
          musicSetNode: musicSetNode,
          trackAnalyzers,
        };
        context.setLoadedMusicSet(musicSetId, musicSetData);

        // Initialize track state
        const trackStates: MusicTrackState[] = musicSet.tracks.map(
          (track, index) => ({
            id: track.id,
            name: track.name,
            isMuted: false,
            isSolo: false,
            isEffectivelyMuted: false,
            volume: context.config.defaultSettings.trackVolume,
            pan: context.config.defaultSettings.trackPan,
          })
        );
        context.setTracks(trackStates);

        // Start playback of all tracks
        trackNodes.forEach((nodes) => startTrack(nodes));

        // Fade in the music set from 0 to target volume
        fadeInMusicSet(trackNodes, 2);

        context.setPlaying(true);

        context.setCurrentMusicSet(musicSetId);
        context.setLoadingMusicSet(null);
      } catch (error) {
        console.error(`Error loading music set ${musicSetId}:`, error);
        context.setLoadingMusicSet(null);
      }
    },
    [context]
  );

  /**
   * Unloads the current music set and cleans up resources.
   */
  const unloadCurrentMusicSet = useCallback(() => {
    if (context.currentSet === null) return;

    const musicSetData = context.loadedSets.get(context.currentSet);
    if (!musicSetData) return;

    // Unregister track analyzers from AudioDataProvider
    musicSetData.trackAnalyzers.forEach((_, trackId) => {
      AudioDataProvider.unregisterTrackAnalyzer(trackId);
    });

    // Stop all tracks immediately
    musicSetData.nodes.forEach((nodes) => stopTrack(nodes));

    // Disconnect all track nodes and the music set node
    disconnectMusicSetNodes(musicSetData.musicSetNode, musicSetData.nodes);

    // Remove from loaded music sets
    context.unloadMusicSet(context.currentSet);
    context.setCurrentMusicSet(null);
    context.setTracks([]);
    context.setPlaying(false);
  }, [context]);

  /**
   * Switches to a different music set.
   * Unloads the current music set and loads the new one.
   */
  const switchMusicSet = useCallback(
    async (musicSetId: number) => {
      // Don't switch if already on this music set
      if (context.currentSet === musicSetId) return;

      // Unload current music set
      unloadCurrentMusicSet();

      // Load new music set
      await loadMusicSet(musicSetId);
    },
    [context.currentSet, unloadCurrentMusicSet, loadMusicSet]
  );

  return {
    currentMusicSet: context.currentSet,
    loadingMusicSet: context.loadingSet,
    loadMusicSet,
    unloadCurrentMusicSet: unloadCurrentMusicSet,
    switchMusicSet: switchMusicSet,
    availableMusicSets: context.config.musicSets,
  };
}
