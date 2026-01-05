"use client";

import React, { useState, useEffect, useRef } from "react";
import { Flex, IconButton, SmartLink, Text } from "@/once-ui/components";
import { AudioPanelToggle } from "./AudioPanelToggle";
import { AudioControls } from "./AudioControls";
import { TrackControlsGrid } from "./TrackControlsGrid";
import { audioCtx, audioError } from "@/app/audio/audio";
import styles from "./AudioControlPanel.module.scss";
import classNames from "classnames";

/**
 * Main audio control panel component.
 *
 * Provides a collapsible/expandable interface for controlling audio playback:
 * - **Collapsed state**: Shows a compact toggle button
 * - **Expanded state**: Shows full audio controls (master controls + track grid)
 *
 * Responsive positioning:
 * - Desktop: Fixed below the header, centered horizontally
 * - Mobile: Fixed above the bottom navbar
 *
 * The panel adapts its width to match the navigation controls and includes
 * a fade-in animation on page load.
 */
export const AudioControlPanel: React.FC = () => {
  /** Whether the panel is expanded to show full controls */
  const [isExpanded, setIsExpanded] = useState(false);

  /** Width of the navbar controls, used to size the panel */
  const [navbarWidth, setNavbarWidth] = useState(0);

  /** Whether the panel has faded in (for smooth appearance on load) */
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Measure the navbar controls width on mount and window resize.
   *
   * The panel width is based on the navbar width to maintain visual alignment:
   * - Collapsed: 85% of navbar width
   * - Expanded: 100% of navbar width
   */
  useEffect(() => {
    const measureNavbar = () => {
      const navControls = document.getElementById("nav-controls");
      if (navControls) {
        setNavbarWidth(navControls.offsetWidth);
      }
    };

    measureNavbar();
    window.addEventListener("resize", measureNavbar);

    return () => {
      window.removeEventListener("resize", measureNavbar);
    };
  }, []);

  /**
   * Fade in the panel after page load.
   *
   * Waits for the document to be fully loaded, then adds a 500ms delay
   * before triggering the fade-in animation (via CSS transition).
   */
  useEffect(() => {
    // Wait for page to be fully loaded
    if (document.readyState === "complete") {
      // Add a small delay then fade in
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Listen for load event
      const handleLoad = () => {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
      };
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  /**
   * Calculate panel widths based on navbar width.
   *
   * - Collapsed: 85% of navbar (slightly narrower for visual distinction)
   * - Expanded: 100% of navbar (full width for all controls)
   */
  const collapsedWidth = navbarWidth > 0 ? navbarWidth * 0.85 : undefined;
  const expandedWidth = navbarWidth > 0 ? navbarWidth : undefined;

  /**
   * Toggle between collapsed and expanded states.
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  /**
   * Check if the browser/device supports Web Audio API.
   *
   * If not supported, show an error message instead of audio controls.
   */
  const hasAudioSupport = !audioError && audioCtx !== undefined;

  return (
    <div
      className={classNames(styles.container, {
        [styles.visible]: isVisible,
      })}
    >
      <Flex
        direction="column"
        gap="12"
        style={{
          width: isExpanded
            ? expandedWidth
              ? `${expandedWidth}px`
              : "100%"
            : collapsedWidth
            ? `${collapsedWidth}px`
            : "85%",
          margin: "0 auto",
        }}
      >
        {!isExpanded ? (
          <AudioPanelToggle onClick={toggleExpanded} />
        ) : (
          <Flex
            direction="column"
            radius="m"
            background="page"
            border="neutral-medium"
            className={classNames(styles.panel, styles.expanded)}
          >
            {/* Close button */}
            <Flex horizontal="space-between" vertical="center">
              <Text variant="heading-strong-s" onBackground="neutral-strong">
                Audio Controls
              </Text>
              <IconButton
                icon="close"
                size="s"
                variant="ghost"
                tooltip="Close"
                onClick={toggleExpanded}
                aria-label="Close audio controls"
              />
            </Flex>

            {/* Show error message if audio is not supported */}
            {!hasAudioSupport ? (
              <Flex
                direction="column"
                radius="m"
                background="neutral-weak"
                border="neutral-medium"
                className={styles.errorMessage}
              >
                <Text variant="body-default-m" onBackground="neutral-strong">
                  This option requires web audio support from your browser and
                  device. Ensure you have an audio output available and your
                  browser is allowing audio.
                </Text>
              </Flex>
            ) : (
              <>
                {/* Master controls */}
                <Flex>
                  <SmartLink href="/work/av-the-game">
                    Music from<i>A.V.</i>
                  </SmartLink>
                </Flex>
                <Flex>
                  <SmartLink href="/work/customizing-portfolio-template-instance">
                    Learn more about this feature.
                  </SmartLink>
                </Flex>
                <AudioControls />

                {/* Track controls */}
                <TrackControlsGrid />
              </>
            )}
          </Flex>
        )}
      </Flex>
    </div>
  );
};
