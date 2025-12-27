"use client";

import React from "react";
import { Grid } from "@/once-ui/components";
import { TrackControl } from "./TrackControl";
import { useTrackControls } from "@/hooks/audio/useTrackControls";

export const TrackControlsGrid: React.FC = () => {
  const { tracks } = useTrackControls();

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
    >
      {tracks.map((track) => (
        <TrackControl
          key={track.id}
          trackId={track.id}
          trackName={track.name}
        />
      ))}
    </Grid>
  );
};
