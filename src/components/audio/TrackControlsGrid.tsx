"use client";

import React from "react";
import { Grid } from "@/once-ui/components";
import { TrackControl } from "./TrackControl";
import { useTrackControls } from "@/hooks/audio/useTrackControls";
import type { MaskRadiusAnimatorParams } from "@/effect/animators";

interface TrackControlsGridProps {
  /** Config params for track visualizer effects (shared by all tracks) */
  visualizerConfig: Omit<
    MaskRadiusAnimatorParams,
    "enabled" | "intensityMultipliers" | "trackId"
  > | null;
}

/**
 * Grid layout for individual track controls.
 *
 * Displays all tracks from the currently loaded music set in a responsive grid:
 * - Desktop (>1024px): 3 columns
 * - Tablet (768px-1024px): 2 columns
 * - Mobile (<768px): 1 column
 *
 * Each track gets its own TrackControl component with mute, solo, volume, and pan controls.
 * If no tracks are loaded, the grid is hidden.
 */
export const TrackControlsGrid: React.FC<TrackControlsGridProps> = ({
  visualizerConfig,
}) => {
  const { tracks } = useTrackControls();

  // Don't render the grid if there are no tracks loaded
  if (tracks.length === 0) {
    return null;
  }

  return (
    <Grid
      columns={3}
      tabletColumns={2}
      mobileColumns={1}
      gap="12"
      fillWidth
      style={{ boxSizing: "border-box" }}
    >
      {tracks.map((track) => (
        <TrackControl
          key={track.id}
          trackId={track.id}
          trackName={track.name}
          visualizerConfig={visualizerConfig}
        />
      ))}
    </Grid>
  );
};
