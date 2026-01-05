import { Assert } from "@/utils/assert";
import { MusicTrackNodes } from "./types";
import { disconnectTrackNodes, stopTrack } from "./tracks";
import { audioAnalyzer, audioCtx } from "./audio";

/**
 * Disconnects and cleans up a music set node and all its connected tracks.
 *
 * @param musicSetGainNode - GainNode for the music set
 * @param trackNodes - Array of TrackNodes connected to this music set
 */
export function disconnectMusicSetNodes(
  musicSetGainNode: GainNode,
  trackNodes: MusicTrackNodes[]
): void {
  // Stop all tracks first
  trackNodes.forEach((nodes) => stopTrack(nodes));

  // Cleanup all track nodes
  trackNodes.forEach((nodes) => disconnectTrackNodes(nodes));

  // Disconnect music set node
  musicSetGainNode.disconnect();
}

/**
 * Creates a gain node for a music set.
 * All tracks in the music set connect to this music set.
 *
 * @returns GainNode for the music set
 */
export function createMusicSetNode(): GainNode {
  Assert.isTrue(
    audioCtx !== undefined && audioAnalyzer !== undefined,
    "createTrackNodes - unable to create nodes. Audio is not correctly setup."
  );

  // Create the node at full volume by default. This will not be used directly
  // to manage volume for the music sets
  const musicSetGainNode = audioCtx.createGain();
  musicSetGainNode.gain.value = 1.0;

  // Connect music set node to analyzer (for animations) and root (for output)
  musicSetGainNode.connect(audioAnalyzer);

  return musicSetGainNode;
}

/**
 * Fades in all tracks in a music set from 0 to their target volume.
 *
 * @param trackNodes - Array of track nodes to fade in
 * @param duration - Duration of fade in seconds (default: 2)
 */
export function fadeInMusicSet(
  trackNodes: MusicTrackNodes[],
  duration: number = 2
): void {
  Assert.exists(
    audioCtx,
    "fadeInMusicSet - unable to fade in. No audio context exists."
  );

  const now = audioCtx.currentTime;

  trackNodes.forEach((nodes) => {
    // Store the target volume
    const targetVolume = nodes.gain.gain.value;

    // Start from 0
    nodes.gain.gain.setValueAtTime(0, now);

    // Fade to target volume over the duration
    nodes.gain.gain.linearRampToValueAtTime(targetVolume, now + duration);
  });
}
