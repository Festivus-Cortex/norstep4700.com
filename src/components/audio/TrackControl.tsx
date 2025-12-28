"use client";

import React, { useCallback } from "react";
import { Flex, IconButton, Text } from "@/once-ui/components";
import { Slider } from "./Slider";
import { useTrackControls } from "@/hooks/audio/useTrackControls";
import styles from "./TrackControl.module.scss";
import classNames from "classnames";

/**
 * Converts a stored volume value to a slider display value.
 * Since gain is squared when applied, we take the square root for display.
 */
const volumeToSlider = (volume: number): number => Math.sqrt(volume);

/**
 * Converts a slider value back to a stored volume value.
 * The slider shows square root values, so we square them for storage.
 */
const sliderToVolume = (slider: number): number => slider * slider;

interface TrackControlProps {
  trackId: string;
  trackName: string;
  className?: string;
}

export const TrackControl = React.memo<TrackControlProps>(
  ({ trackId, trackName, className }) => {
    const { tracks, toggleMute, toggleSolo, updateVolume, updatePan } =
      useTrackControls();

    const track = tracks.find((t) => t.id === trackId);

    const handleMuteToggle = useCallback(() => {
      toggleMute(trackId);
    }, [trackId, toggleMute]);

    const handleSoloToggle = useCallback(() => {
      toggleSolo(trackId);
    }, [trackId, toggleSolo]);

    const handleVolumeChange = useCallback(
      (sliderValue: number) => {
        // Convert slider value (square root) back to actual volume (squared)
        updateVolume(trackId, sliderToVolume(sliderValue));
      },
      [trackId, updateVolume]
    );

    const handlePanChange = useCallback(
      (pan: number) => {
        updatePan(trackId, pan);
      },
      [trackId, updatePan]
    );

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
          mode="volume"
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
          mode="pan"
        />
      </Flex>
    );
  }
);

TrackControl.displayName = "TrackControl";
