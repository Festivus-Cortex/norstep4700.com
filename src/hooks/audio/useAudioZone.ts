"use client";

import { useCallback } from "react";
import { useAudioContext } from "@/context/AudioContext";
import { loadMultipleAudioBuffers } from "@/app/audio/audioLoader";
import {
  createMusicSetNode,
  createTrackNodes,
  disconnectZoneNodes,
  startTrack,
} from "@/app/audio/audioNodes";
import { MusicTrackState, MusicSetData } from "@/app/audio/audioTypes";

// FIXME: ADJUST NAMING AND ASSERTS!
/**
 * Hook for managing zone loading, switching, and cleanup.
 */
export function useAudioZone() {
  const context = useAudioContext();

  /**
   * Loads a zone's audio buffers and creates Web Audio nodes.
   */
  const loadZone = useCallback(
    async (zoneId: number) => {
      const zone = context.config.musicSets.find((z) => z.id === zoneId);
      if (!zone) {
        console.error(`Zone ${zoneId} not found`);
        return;
      }

      context.setLoadingZone(zoneId);

      try {
        // Load all track buffers for this zone
        const trackPaths = zone.tracks.map((track) => track.path);
        const buffers = await loadMultipleAudioBuffers(trackPaths);

        // Create zone node
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

        // Store zone data
        const zoneData: MusicSetData = {
          setId: zoneId,
          buffers,
          nodes: trackNodes,
        };
        context.setLoadedZone(zoneId, zoneData);

        // Initialize track state
        const trackStates: MusicTrackState[] = zone.tracks.map(
          (track, index) => ({
            id: track.id,
            name: track.name,
            isMuted: false,
            isSolo: false,
            volume: context.config.defaultSettings.trackVolume,
            pan: context.config.defaultSettings.trackPan,
          })
        );
        context.setTracks(trackStates);

        // Start playback of all tracks
        trackNodes.forEach((nodes) => startTrack(nodes));
        context.setPlaying(true);

        context.setCurrentZone(zoneId);
        context.setLoadingZone(null);
      } catch (error) {
        console.error(`Error loading zone ${zoneId}:`, error);
        context.setLoadingZone(null);
      }
    },
    [context]
  );

  /**
   * Unloads the current zone and cleans up resources.
   */
  const unloadCurrentZone = useCallback(() => {
    if (context.currentZone === null) return;

    const zoneData = context.loadedZones.get(context.currentZone);
    if (!zoneData) return;

    // Find the zone node (it's the parent of the first track node)
    const firstTrackNode = zoneData.nodes[0];
    if (firstTrackNode) {
      // Get the zone node by traversing the graph
      // The zone node is connected to the first track's pan node
      const zoneNode = firstTrackNode.pan.context.createGain();

      // Disconnect all track nodes and the zone node
      disconnectZoneNodes(zoneNode, zoneData.nodes);
    }

    // Remove from loaded zones
    context.unloadZone(context.currentZone);
    context.setCurrentZone(null);
    context.setTracks([]);
    context.setPlaying(false);
  }, [context]);

  /**
   * Switches to a different zone.
   * Unloads the current zone and loads the new one.
   */
  const switchZone = useCallback(
    async (zoneId: number) => {
      // Don't switch if already on this zone
      if (context.currentZone === zoneId) return;

      // Unload current zone
      unloadCurrentZone();

      // Load new zone
      await loadZone(zoneId);
    },
    [context.currentZone, unloadCurrentZone, loadZone]
  );

  return {
    currentZone: context.currentZone,
    loadingZone: context.loadingZone,
    loadZone,
    unloadCurrentZone,
    switchZone,
    availableZones: context.config.musicSets,
  };
}
