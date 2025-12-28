"use client";

import { useCallback } from "react";
import { useAudioContext } from "@/context/AudioContext";
import { setTrackVolume, setTrackPan } from "@/app/audio/tracks";
import { linearToGain } from "@/app/audio/audio";

/**
 * Hook for managing individual track controls (mute, solo, volume, pan).
 */
export function useTrackControls() {
  const context = useAudioContext();

  /**
   * Gets the track nodes for a specific track.
   */
  const getTrackNodes = useCallback(
    (trackId: string) => {
      if (!context.currentSet) return null;

      const zoneData = context.loadedSets.get(context.currentSet);
      if (!zoneData) return null;

      const trackIndex = context.tracks.findIndex((t) => t.id === trackId);
      if (trackIndex === -1) return null;

      return zoneData.nodes[trackIndex];
    },
    [context.currentSet, context.loadedSets, context.tracks]
  );

  /**
   * Toggles mute for a track.
   */
  const toggleMute = useCallback(
    (trackId: string) => {
      const track = context.tracks.find((t) => t.id === trackId);
      if (!track) return;

      const nodes = getTrackNodes(trackId);
      if (!nodes) return;

      const newMuted = !track.isMuted;
      nodes.gain.gain.value = newMuted ? 0 : linearToGain(track.volume);

      context.updateTrack(trackId, { isMuted: newMuted });
    },
    [context, getTrackNodes]
  );

  /**
   * Toggles solo for a track.
   * When solo is enabled, all other tracks are muted.
   */
  const toggleSolo = useCallback(
    (trackId: string) => {
      const track = context.tracks.find((t) => t.id === trackId);
      if (!track) return;

      const newSolo = !track.isSolo;

      // Update all tracks
      context.tracks.forEach((t) => {
        const nodes = getTrackNodes(t.id);
        if (!nodes) return;

        if (t.id === trackId) {
          // Toggle solo on this track
          context.updateTrack(t.id, { isSolo: newSolo });
          // Unmute when solo is enabled
          if (newSolo) {
            nodes.gain.gain.value = linearToGain(t.volume);
            context.updateTrack(t.id, { isMuted: false });
          }
        } else {
          // Mute/unmute other tracks based on solo state
          if (newSolo) {
            // Mute other tracks when solo is enabled
            nodes.gain.gain.value = 0;
            context.updateTrack(t.id, { isMuted: true });
          } else {
            // Restore other tracks when solo is disabled
            nodes.gain.gain.value = t.isMuted ? 0 : linearToGain(t.volume);
          }
          // Clear solo state on other tracks
          context.updateTrack(t.id, { isSolo: false });
        }
      });
    },
    [context, getTrackNodes]
  );

  /**
   * Updates the volume for a track.
   */
  const updateVolume = useCallback(
    (trackId: string, volume: number) => {
      const track = context.tracks.find((t) => t.id === trackId);
      if (!track) return;

      const nodes = getTrackNodes(trackId);
      if (!nodes) return;

      // Update volume node (unless muted)
      if (!track.isMuted) {
        setTrackVolume(nodes, volume);
      }

      context.updateTrack(trackId, { volume });
    },
    [context, getTrackNodes]
  );

  /**
   * Updates the pan for a track.
   */
  const updatePan = useCallback(
    (trackId: string, pan: number) => {
      const nodes = getTrackNodes(trackId);
      if (!nodes) return;

      setTrackPan(nodes, pan);
      context.updateTrack(trackId, { pan });
    },
    [context, getTrackNodes]
  );

  return {
    tracks: context.tracks,
    toggleMute,
    toggleSolo,
    updateVolume,
    updatePan,
  };
}
