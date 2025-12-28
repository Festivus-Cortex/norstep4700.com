import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { AudioConfig, MusicSets, MusicTrack } from "@/app/audio/types";
import { getAudioConfigDefaultSettings } from "@/app/audio/getAudioConfig";

/**
 * GET /api/audio-config
 *
 * Server-side API route that scans the public/audio directory
 * and returns the audio configuration dynamically.
 */
export async function GET() {
  const audioDir = path.join(process.cwd(), "public", "audio");

  try {
    // Read all subdirectories in public/audio/
    const entries = fs.readdirSync(audioDir, { withFileTypes: true });
    const musicDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(); // Sort to ensure consistent ordering

    const musicSets: MusicSets[] = musicDirs.map((setName, index) => {
      const setPath = path.join(audioDir, setName);

      // Read all .mp3 files in the zone directory
      const trackFiles = fs
        .readdirSync(setPath)
        .filter((file) => file.endsWith(".mp3"))
        .sort(); // Sort to ensure consistent track ordering

      const tracks: MusicTrack[] = trackFiles.map((filename) => {
        // Remove .mp3 extension for ID
        const id = filename.replace(/\.mp3$/, "");

        // Capitalize first letter for display name
        const name = id.charAt(0).toUpperCase() + id.slice(1);

        // Build path relative to public directory
        const trackPath = `/audio/${setName}/${filename}`;

        return { id, name, path: trackPath };
      });

      return {
        id: index + 1,
        name: setName,
        displayName: `A.V. ${
          setName.charAt(0).toUpperCase() + setName.slice(1)
        }`,
        tracks,
      };
    });

    const config: AudioConfig = {
      musicSets: musicSets,
      defaultSettings: getAudioConfigDefaultSettings(),
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error scanning audio directory:", error);

    // Return a proper error response with status code and details
    return NextResponse.json(
      {
        error: "Failed to scan audio directory",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
