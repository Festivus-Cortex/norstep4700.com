"use client";

import React, { useCallback, useState } from "react";
import { Flex, IconButton, SegmentedControl, Spinner, Text } from "@/once-ui/components";
import { Slider } from "./Slider";
import { useAudioManager } from "@/hooks/audio/useAudioManager";
import { useAudioZone } from "@/hooks/audio/useAudioZone";
import styles from "./MasterControls.module.scss";

export const MasterControls: React.FC = () => {
  const {
    isMasterMuted,
    masterVolume,
    toggleMasterMute,
    updateMasterVolume,
    initializeAudio,
    isInitialized,
  } = useAudioManager();

  const { currentZone, loadingZone, switchZone, availableZones } = useAudioZone();

  const [hasInteracted, setHasInteracted] = useState(false);

  // Create zone options for SegmentedControl
  const zoneOptions = availableZones.map((zone) => ({
    label: zone.displayName,
    value: zone.id.toString(),
  }));

  const handleZoneChange = useCallback(
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
    (volume: number) => {
      if (!isInitialized) {
        initializeAudio();
      }

      if (!hasInteracted) {
        setHasInteracted(true);
      }

      updateMasterVolume(volume);
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
      {/* Zone Selector */}
      <Flex direction="column" gap="8">
        <Text variant="label-default-m" onBackground="neutral-strong">
          Zone Selection
        </Text>
        <Flex gap="8" vertical="center">
          <SegmentedControl
            buttons={zoneOptions}
            selected={currentZone?.toString() || ""}
            onToggle={handleZoneChange}
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
          variant={isMasterMuted ? "danger" : "accent"}
          tooltip={isMasterMuted ? "Unmute All" : "Mute All"}
          onClick={handleMuteToggle}
          aria-label={isMasterMuted ? "Unmute all tracks" : "Mute all tracks"}
        />
        <Slider
          value={masterVolume}
          onChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.01}
          label="Master Volume"
          mode="volume"
          disabled={isMasterMuted}
        />
      </Flex>
    </Flex>
  );
};
