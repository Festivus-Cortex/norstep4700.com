"use client";

// FIXME: Correct imports and assertions. Strip out util functions that are not useful.

import { audioCtx, audioRoot, audioAnalyzer } from "./audio";
import { TrackNodes } from "./audioTypes";

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
  initialVolume: number = 0.8,
  initialPan: number = 0,
  loop: boolean = true
): TrackNodes {
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
 * Creates a gain node for a music set.
 * All tracks in the music set connect to this node.
 *
 * @returns GainNode for the music set
 */
export function createMusicSetNode(): GainNode {
  const zoneNode = audioCtx.createGain();
  zoneNode.gain.value = 1.0; // Full volume by default

  // Connect music set node to analyzer (for animations) and root (for output)
  zoneNode.connect(audioAnalyzer);

  return zoneNode;
}

/**
 * Disconnects and cleans up all nodes for a track.
 *
 * @param nodes - TrackNodes object to cleanup
 */
export function disconnectTrackNodes(nodes: TrackNodes): void {
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
 * Disconnects and cleans up a zone node and all its connected tracks.
 *
 * @param zoneNode - GainNode for the zone
 * @param trackNodes - Array of TrackNodes connected to this zone
 */
export function disconnectZoneNodes(
  zoneNode: GainNode,
  trackNodes: TrackNodes[]
): void {
  // Cleanup all track nodes
  trackNodes.forEach((nodes) => disconnectTrackNodes(nodes));

  // Disconnect zone node
  zoneNode.disconnect();
}

/**
 * Sets the master volume.
 *
 * @param volume - Volume level (0-1)
 */
export function setMasterVolume(volume: number): void {
  audioRoot.gain.value = Math.max(0, Math.min(1, volume));
}

/**
 * Sets the volume for a specific track.
 *
 * @param trackNodes - TrackNodes for the track
 * @param volume - Volume level (0-1)
 */
export function setTrackVolume(trackNodes: TrackNodes, volume: number): void {
  trackNodes.gain.gain.value = Math.max(0, Math.min(1, volume));
}

/**
 * Sets the pan for a specific track.
 *
 * @param trackNodes - TrackNodes for the track
 * @param pan - Pan position (-1 = left, 0 = center, 1 = right)
 */
export function setTrackPan(trackNodes: TrackNodes, pan: number): void {
  trackNodes.pan.pan.value = Math.max(-1, Math.min(1, pan));
}

/**
 * Mutes or unmutes a track.
 *
 * @param trackNodes - TrackNodes for the track
 * @param muted - Whether to mute the track
 */
export function setTrackMute(trackNodes: TrackNodes, muted: boolean): void {
  trackNodes.gain.gain.value = muted ? 0 : trackNodes.gain.gain.value;
}

/**
 * Starts playback of a track.
 *
 * @param trackNodes - TrackNodes for the track
 * @param when - When to start (in seconds, default = now)
 */
export function startTrack(trackNodes: TrackNodes, when: number = 0): void {
  trackNodes.source.start(when);
}

/**
 * Stops playback of a track.
 *
 * @param trackNodes - TrackNodes for the track
 */
export function stopTrack(trackNodes: TrackNodes): void {
  try {
    trackNodes.source.stop();
  } catch (e) {
    // Track may not be playing
  }
}
