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
import styles from "./MasterControls.module.scss";

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

export const MasterControls: React.FC = () => {
  const {
    isMasterMuted,
    masterVolume,
    toggleMasterMute,
    updateMasterVolume,
    initializeAudio,
    isInitialized,
  } = useAudioManager();

  const { currentZone, loadingZone, switchZone, availableZones } =
    useAudioMusicSet();

  const [hasInteracted, setHasInteracted] = useState(false);

  // Create zone options for SegmentedControl
  const zoneOptions = availableZones.map((zone) => ({
    label: zone.displayName,
    value: zone.id.toString(),
  }));

  const handleMusicSetChange = useCallback(
    async (value: string) => {
      if (!isInitialized) {
        initializeAudio();
      }

      if (!hasInteracted) {
        setHasInteracted(true);
      }

      const zoneId = parseInt(value, 10);
      await switchZone(zoneId);
    },
    [switchZone, isInitialized, initializeAudio, hasInteracted]
  );

  const handleMuteToggle = useCallback(() => {
    if (!isInitialized) {
      initializeAudio();
    }

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    toggleMasterMute();
  }, [toggleMasterMute, isInitialized, initializeAudio, hasInteracted]);

  const handleVolumeChange = useCallback(
    (sliderValue: number) => {
      if (!isInitialized) {
        initializeAudio();
      }

      if (!hasInteracted) {
        setHasInteracted(true);
      }

      // Convert slider value (square root) back to actual volume (squared)
      updateMasterVolume(sliderToVolume(sliderValue));
    },
    [updateMasterVolume, isInitialized, initializeAudio, hasInteracted]
  );

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
          Music Selection
        </Text>
        <Flex gap="8" vertical="center">
          <SegmentedControl
            buttons={zoneOptions}
            selected={currentZone?.toString() || ""}
            onToggle={handleMusicSetChange}
            fillWidth
          />
          {loadingZone !== null && (
            <Spinner size="s" ariaLabel="Loading zone..." />
          )}
        </Flex>
      </Flex>

      {/* Master Controls */}
      <Flex gap="12" vertical="center">
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
          label="Set Volume"
          mode="volume"
          disabled={isMasterMuted}
        />
      </Flex>
    </Flex>
  );
};
