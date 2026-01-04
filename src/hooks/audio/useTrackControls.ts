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
   * Updates both isMuted (user preference) and isEffectivelyMuted (actual audio state).
   */
  const toggleMute = useCallback(
    (trackId: string) => {
      const track = context.tracks.find((t) => t.id === trackId);
      if (!track) return;

      const nodes = getTrackNodes(trackId);
      if (!nodes) return;

      const newMuted = !track.isMuted;

      // Check if any track is soloed
      const anySoloActive = context.tracks.some((t) => t.isSolo);

      // Compute effective mute: user muted OR (solo active AND not soloed)
      const effectivelyMuted = newMuted || (anySoloActive && !track.isSolo);

      // Update audio nodes
      nodes.gain.gain.value = effectivelyMuted ? 0 : linearToGain(track.volume);

      // Update state
      context.updateTrack(trackId, {
        isMuted: newMuted,
        isEffectivelyMuted: effectivelyMuted,
      });
    },
    [context, getTrackNodes]
  );

  /**
   * Toggles solo for a track.
   *
   * Preserves user mute states (isMuted) while computing effective mute (isEffectivelyMuted).
   * Supports multiple tracks being soloed simultaneously.
   */
  const toggleSolo = useCallback(
    (trackId: string) => {
      const track = context.tracks.find((t) => t.id === trackId);
      if (!track) return;

      const newSolo = !track.isSolo;

      // Update solo state for the toggled track first
      context.updateTrack(trackId, { isSolo: newSolo });

      // Check if ANY track is now soloed (including the one we just toggled)
      const anySoloActive = context.tracks.some((t) =>
        t.id === trackId ? newSolo : t.isSolo
      );

      // Update effective mute state for ALL tracks
      context.tracks.forEach((t) => {
        const nodes = getTrackNodes(t.id);
        if (!nodes) return;

        // For the current track being processed, use updated solo state
        const trackIsSolo = t.id === trackId ? newSolo : t.isSolo;

        // Compute effective mute state:
        // - If user muted: always muted
        // - If solo is active and this track is NOT soloed: muted
        const effectivelyMuted = t.isMuted || (anySoloActive && !trackIsSolo);

        // Update the computed state
        context.updateTrack(t.id, { isEffectivelyMuted: effectivelyMuted });

        // Apply to audio nodes
        if (effectivelyMuted) {
          nodes.gain.gain.value = 0;
        } else {
          nodes.gain.gain.value = linearToGain(t.volume);
        }
      });
    },
    [context, getTrackNodes]
  );

  /**
   * Updates the volume for a track.
   * Only applies to audio nodes if the track is not effectively muted.
   */
  const updateVolume = useCallback(
    (trackId: string, volume: number) => {
      const track = context.tracks.find((t) => t.id === trackId);
      if (!track) return;

      const nodes = getTrackNodes(trackId);
      if (!nodes) return;

      // Update volume node (unless effectively muted)
      if (!track.isEffectivelyMuted) {
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
