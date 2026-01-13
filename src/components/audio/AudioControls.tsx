"use client";

import React, { useCallback, useState } from "react";
import {
  Flex,
  IconButton,
  SegmentedControl,
  Spinner,
  Text,
} from "@/once-ui/components";
import { Slider } from "./Slider";
import { useAudioManager } from "@/hooks/audio/useAudioManager";
import { useAudioMusicSet } from "@/hooks/audio/useAudioMusicSet";
import styles from "./AudioControls.module.scss";

/**
 * Converts a stored volume value to a slider display value.
 *
 * Audio gain is applied squared (for perceptual loudness), so we display
 * the square root to give users a linear-feeling control.
 *
 * @param volume - Stored volume value (0-1, will be squared when applied to audio)
 * @returns Display value for slider (0-1, square root of volume)
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
 */
const sliderToVolume = (slider: number): number => slider * slider;

/**
 * Audio controls component.
 *
 * Provides global controls for the audio system:
 * - Music set selector (segmented control)
 * - Master mute/unmute button
 * - Master volume slider affecting all tracks
 *
 * This component handles audio initialization on first user interaction,
 * as browsers require user gestures before playing audio.
 */
export const AudioControls: React.FC = () => {
  const {
    isMasterMuted,
    masterVolume,
    toggleMasterMute,
    togglePlayPause,
    updateMasterVolume,
    initializeAudio,
    isInitialized,
    isPlaying,
  } = useAudioManager();

  const {
    currentMusicSet,
    loadingMusicSet,
    switchMusicSet,
    availableMusicSets,
  } = useAudioMusicSet();

  /**
   * Tracks whether the user has interacted with any audio control.
   * Used to ensure audio context is initialized before playback.
   */
  const [hasInteracted, setHasInteracted] = useState(false);

  /**
   * Convert available music sets to options for the SegmentedControl.
   * Maps music set objects to { label, value } format.
   * Disable all buttons when a music set is loading.
   */
  const isLoadingSet = loadingMusicSet !== null;
  const musicSetOptions = availableMusicSets.map((musicSet) => ({
    label: musicSet.displayName,
    value: musicSet.id.toString(),
    disabled: isLoadingSet,
  }));

  /**
   * Handle music set selection change.
   *
   * Initializes audio context on first interaction, then switches to
   * the selected music set.
   *
   * @param value - Music set ID as string
   */
  const handleMusicSetChange = useCallback(
    async (value: string) => {
      // Initialize audio context if not already done
      if (!isInitialized) {
        await initializeAudio();
      }

      // Track first user interaction
      if (!hasInteracted) {
        setHasInteracted(true);
      }

      const musicSetId = parseInt(value, 10);
      await switchMusicSet(musicSetId);
    },
    [switchMusicSet, isInitialized, initializeAudio, hasInteracted]
  );

  /**
   * Handle master mute toggle.
   *
   * Initializes audio context on first interaction, then toggles
   * the master mute state affecting all tracks.
   */
  const handleMuteToggle = useCallback(async () => {
    // Initialize audio context if not already done
    if (!isInitialized) {
      initializeAudio();
    }

    // Track first user interaction
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    toggleMasterMute();
  }, [toggleMasterMute, isInitialized, initializeAudio, hasInteracted]);

  /**
   * Handle master volume slider changes.
   *
   * Initializes audio context on first interaction, converts the linear
   * slider value to squared volume, and updates the master volume.
   *
   * @param sliderValue - Linear slider value (0-1)
   */
  const handleVolumeChange = useCallback(
    async (sliderValue: number) => {
      // Initialize audio context if not already done
      if (!isInitialized) {
        await initializeAudio();
      }

      // Track first user interaction
      if (!hasInteracted) {
        setHasInteracted(true);
      }

      // Convert slider value (square root) back to actual volume (squared)
      updateMasterVolume(sliderToVolume(sliderValue));
    },
    [updateMasterVolume, isInitialized, initializeAudio, hasInteracted]
  );

  /**
   * Handle play/pause toggle.
   *
   * Initializes audio context on first interaction, then toggles
   * the play/pause state of the audio context.
   */
  const handlePlayPauseToggle = useCallback(async () => {
    // Initialize audio context if not already done
    if (!isInitialized) {
      initializeAudio();
    }

    // Track first user interaction
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    togglePlayPause();
  }, [togglePlayPause, isInitialized, initializeAudio, hasInteracted]);

  return (
    <Flex
      direction="column"
      gap="16"
      padding="16"
      fillWidth
      border="neutral-medium"
      radius="m"
      background="surface"
      className={styles.masterControls}
    >
      {/* Music Set Selector */}
      <Flex direction="column" gap="8">
        <Text variant="label-default-m" onBackground="neutral-strong">
          {currentMusicSet === null
            ? "Please select to continue - Music Selection"
            : "Music Selection"}
        </Text>
        <Flex gap="8" vertical="center">
          <SegmentedControl
            buttons={musicSetOptions}
            selected={currentMusicSet?.toString() || ""}
            onToggle={handleMusicSetChange}
            fillWidth
          />
          {loadingMusicSet !== null && (
            <Spinner size="s" ariaLabel="Loading music set..." />
          )}
        </Flex>
      </Flex>

      {/* Music Set Controls */}
      <Flex gap="12" vertical="center">
        {currentMusicSet !== null && (
          <IconButton
            icon={isPlaying ? "pause" : "play"}
            size="m"
            tooltip={isPlaying ? "Pause" : "Play"}
            onClick={handlePlayPauseToggle}
            aria-label={isPlaying ? "Pause playback" : "Play playback"}
          />
        )}
        <IconButton
          icon={isMasterMuted ? "volumeOff" : "volumeHigh"}
          size="m"
          // variant={isMasterMuted ? "danger" : "tertiary"}
          tooltip={isMasterMuted ? "Unmute All" : "Mute All"}
          onClick={handleMuteToggle}
          aria-label={isMasterMuted ? "Unmute all tracks" : "Mute all tracks"}
        />
        <Slider
          value={volumeToSlider(masterVolume)}
          onChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.01}
          disabled={isMasterMuted}
          style={{ width: "200px" }}
        />
      </Flex>
    </Flex>
  );
};
