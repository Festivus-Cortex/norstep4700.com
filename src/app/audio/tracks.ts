"use client";

import { Assert } from "@/utils/assert";

import { audioCtx, audioRoot, audioAnalyzer } from "./audio";
import { MusicTrackNodes } from "./types";

/**
 * Creates a complete set of Web Audio nodes for a single track.
 *
 * Node graph for each track:
 * AudioBufferSourceNode → GainNode (volume/mute) → StereoPannerNode (pan) → parent
 *
 * @param buffer - The AudioBuffer containing the track's audio data
 * @param parent - The parent node to connect to (typically the zone gain node)
 * @param initialVolume - Initial volume level (0-1)
 * @param initialPan - Initial pan position (-1 to 1)
 * @param loop - Whether the track should loop
 * @returns TrackNodes object containing references to all nodes
 */
export function createTrackNodes(
  buffer: AudioBuffer,
  parent: AudioNode,
  initialVolume: number = 0.6,
  initialPan: number = 0,
  loop: boolean = true
): MusicTrackNodes {
  Assert.exists(
    audioCtx,
    "createTrackNodes - unable to create nodes. No audio context exists."
  );

  // Create source node (one-time use in Web Audio API)
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;

  // Create gain node for volume control and mute
  const gain = audioCtx.createGain();
  gain.gain.value = initialVolume;

  // Create stereo panner for left/right positioning
  const pan = audioCtx.createStereoPanner();
  pan.pan.value = initialPan;

  // Connect the chain: source → gain → pan → parent
  source.connect(gain);
  gain.connect(pan);
  pan.connect(parent);

  return { source, gain, pan };
}

/**
 * Disconnects and cleans up all nodes for a track.
 *
 * @param nodes - TrackNodes object to cleanup
 */
export function disconnectTrackNodes(nodes: MusicTrackNodes): void {
  try {
    nodes.source.stop();
  } catch (e) {
    // Source may not be playing
  }

  nodes.source.disconnect();
  nodes.gain.disconnect();
  nodes.pan.disconnect();
}

/**
 * Sets the volume for a specific track.
 *
 * @param trackNodes - TrackNodes for the track
 * @param volume - Volume level (0-1)
 */
export function setTrackVolume(
  trackNodes: MusicTrackNodes,
  volume: number
): void {
  trackNodes.gain.gain.value = Math.max(0, Math.min(1, volume));
}

/**
 * Sets the pan for a specific track.
 *
 * @param trackNodes - MusicTrackNodes for the track
 * @param pan - Pan position (-1 = left, 0 = center, 1 = right)
 */
export function setTrackPan(trackNodes: MusicTrackNodes, pan: number): void {
  trackNodes.pan.pan.value = Math.max(-1, Math.min(1, pan));
}

/**
 * Mutes or unmutes a track.
 *
 * @param trackNodes - MusicTrackNodes for the track
 * @param muted - Whether to mute the track
 */
export function setTrackMute(
  trackNodes: MusicTrackNodes,
  muted: boolean
): void {
  trackNodes.gain.gain.value = muted ? 0 : trackNodes.gain.gain.value;
}

/**
 * Starts playback of a track.
 *
 * @param trackNodes - MusicTrackNodes for the track
 * @param when - When to start (in seconds, default = now)
 */
export function startTrack(
  trackNodes: MusicTrackNodes,
  when: number = 0
): void {
  trackNodes.source.start(when);
}

/**
 * Stops playback of a track.
 *
 * @param trackNodes - MusicTrackNodes for the track
 */
export function stopTrack(trackNodes: MusicTrackNodes): void {
  try {
    trackNodes.source.stop();
  } catch (e) {
    // Track may not be playing
  }
}
