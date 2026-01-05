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

/**
 * Hook for managing music set loading, switching, and cleanup.
 */
export function useAudioMusicSet() {
  const context = useAudioState();

  /**
   * Loads a music set's audio buffers and creates Web Audio nodes.
   */
  const loadZone = useCallback(
    async (musicSetId: number) => {
      const musicSet = context.config.musicSets.find(
        (z) => z.id === musicSetId
      );
      if (!musicSet) {
        console.error(`Music set ${musicSetId} not found`);
        return;
      }

      context.setLoadingZone(musicSetId);

      try {
        // Load all track buffers for this music set
        const trackPaths = musicSet.tracks.map((track) => track.path);
        const buffers = await loadMultipleAudioBuffers(trackPaths);

        // Create music set node
        const zoneNode = createMusicSetNode();

        // Create nodes for each track
        const trackNodes = buffers.map((buffer, index) => {
          return createTrackNodes(
            buffer,
            zoneNode,
            context.config.defaultSettings.trackVolume,
            context.config.defaultSettings.trackPan,
            true // loop
          );
        });

        // Store music set data
        const zoneData: MusicSetData = {
          setId: musicSetId,
          buffers,
          nodes: trackNodes,
        };
        context.setLoadedZone(musicSetId, zoneData);

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

        context.setCurrentZone(musicSetId);
        context.setLoadingZone(null);
      } catch (error) {
        console.error(`Error loading music set ${musicSetId}:`, error);
        context.setLoadingZone(null);
      }
    },
    [context]
  );

  /**
   * Unloads the current music set and cleans up resources.
   */
  const unloadCurrentMusicSet = useCallback(() => {
    if (context.currentSet === null) return;

    const zoneData = context.loadedSets.get(context.currentSet);
    if (!zoneData) return;

    // Stop all tracks immediately
    zoneData.nodes.forEach((nodes) => stopTrack(nodes));

    // Find the music set node (it's the parent of the first track node)
    const firstTrackNode = zoneData.nodes[0];
    if (firstTrackNode) {
      // Get the music set node by traversing the graph
      // The music set node is connected to the first track's pan node
      const zoneNode = firstTrackNode.pan.context.createGain();

      // Disconnect all track nodes and the music set node
      disconnectMusicSetNodes(zoneNode, zoneData.nodes);
    }

    // Remove from loaded zones
    context.unloadZone(context.currentSet);
    context.setCurrentZone(null);
    context.setTracks([]);
    context.setPlaying(false);
  }, [context]);

  /**
   * Switches to a different music set.
   * Unloads the current music set and loads the new one.
   */
  const switchMusicSet = useCallback(
    async (zoneId: number) => {
      // Don't switch if already on this music set
      if (context.currentSet === zoneId) return;

      // Unload current music set
      unloadCurrentMusicSet();

      // Load new music set
      await loadZone(zoneId);
    },
    [context.currentSet, unloadCurrentMusicSet, loadZone]
  );

  return {
    currentZone: context.currentSet,
    loadingZone: context.loadingSet,
    loadZone,
    unloadCurrentZone: unloadCurrentMusicSet,
    switchZone: switchMusicSet,
    availableZones: context.config.musicSets,
  };
}
