"use client";

import React, { useCallback } from "react";
import { Flex, IconButton, Text } from "@/once-ui/components";
import { Slider } from "./Slider";
import { useTrackControls } from "@/hooks/audio/useTrackControls";
import styles from "./TrackControl.module.scss";
import classNames from "classnames";

/**
 * Converts a stored volume value to a slider display value.
 *
 * Audio gain is applied squared (for perceptual loudness), so we display
 * the square root to give users a linear-feeling control.
 *
 * @param volume - Stored volume value (0-1, will be squared when applied to audio)
 * @returns Display value for slider (0-1, square root of volume)
 *
 * @example
 * volumeToSlider(0.25) // Returns 0.5 (sqrt of 0.25)
 */
const volumeToSlider = (volume: number): number => Math.sqrt(volume);

/**
 * Converts a slider value back to a stored volume value.
 *
 * Since the slider displays square root values, we square the input
 * to get the actual volume value to store and apply.
 *
 * @param slider - Slider display value (0-1)
 * @returns Stored volume value (0-1, squared)
 *
 * @example
 * sliderToVolume(0.5) // Returns 0.25 (0.5 squared)
 */
const sliderToVolume = (slider: number): number => slider * slider;

/**
 * Props for the TrackControl component.
 */
interface TrackControlProps {
  /** Unique identifier for the track */
  trackId: string;

  /** Display name for the track */
  trackName: string;

  /** Optional CSS class name */
  className?: string;
}

/**
 * Individual track control component.
 *
 * Provides controls for a single audio track including:
 * - Mute/unmute button
 * - Solo button (mutes all other tracks)
 * - Volume slider with perceptually-linear scaling
 * - Pan slider for stereo positioning (-1 = left, 0 = center, 1 = right)
 *
 * The component is memoized to prevent unnecessary re-renders when other tracks change.
 */
export const TrackControl = React.memo<TrackControlProps>(
  ({ trackId, trackName, className }) => {
    const { tracks, toggleMute, toggleSolo, updateVolume, updatePan } =
      useTrackControls();

    // Find the track state for this specific track
    const track = tracks.find((t) => t.id === trackId);

    /**
     * Toggle mute state for this track.
     * When muted, the track's volume is set to 0.
     */
    const handleMuteToggle = useCallback(() => {
      toggleMute(trackId);
    }, [trackId, toggleMute]);

    /**
     * Toggle solo state for this track.
     * When solo is enabled, all other tracks are muted.
     * When solo is disabled, other tracks return to their previous mute state.
     */
    const handleSoloToggle = useCallback(() => {
      toggleSolo(trackId);
    }, [trackId, toggleSolo]);

    /**
     * Handle volume slider changes.
     * Converts the linear slider value to squared volume for perceptual loudness.
     */
    const handleVolumeChange = useCallback(
      (sliderValue: number) => {
        // Convert slider value (square root) back to actual volume (squared)
        updateVolume(trackId, sliderToVolume(sliderValue));
      },
      [trackId, updateVolume]
    );

    /**
     * Handle pan slider changes.
     * Pan value is used directly without conversion (-1 to 1).
     */
    const handlePanChange = useCallback(
      (pan: number) => {
        updatePan(trackId, pan);
      },
      [trackId, updatePan]
    );

    // Don't render if track not found
    if (!track) return null;

    return (
      <Flex
        direction="column"
        gap="8"
        padding="12"
        border="neutral-medium"
        radius="m"
        background="surface"
        className={classNames(styles.trackControl, className)}
      >
        {/* Track name and control buttons */}
        <Flex horizontal="space-between" vertical="center" gap="8">
          <Text variant="label-default-m" onBackground="neutral-strong">
            {trackName}
          </Text>
          <Flex gap="4">
            <IconButton
              icon={track.isMuted ? "volumeOff" : "volume2"}
              size="s"
              variant={track.isMuted ? "danger" : "ghost"}
              tooltip={track.isMuted ? "Unmute" : "Mute"}
              onClick={handleMuteToggle}
              aria-label={`${track.isMuted ? "Unmute" : "Mute"} ${trackName}`}
            />
            <IconButton
              icon="star"
              size="s"
              // variant={track.isSolo ? "tertiary" : "ghost"}
              tooltip={track.isSolo ? "Unsolo" : "Solo"}
              onClick={handleSoloToggle}
              aria-label={`${track.isSolo ? "Unsolo" : "Solo"} ${trackName}`}
            />
          </Flex>
        </Flex>

        {/* Volume slider */}
        <Slider
          value={volumeToSlider(track.volume)}
          onChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.01}
          label="Volume"
          disabled={track.isMuted}
        />

        {/* Pan slider */}
        <Slider
          value={track.pan}
          onChange={handlePanChange}
          min={-1}
          max={1}
          step={0.01}
          label="Pan"
        />
      </Flex>
    );
  }
);

TrackControl.displayName = "TrackControl";
