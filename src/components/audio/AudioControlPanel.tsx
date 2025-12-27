"use client";

import React, { useState, useEffect, useRef } from "react";
import { Flex, IconButton, Text } from "@/once-ui/components";
import { AudioPanelToggle } from "./AudioPanelToggle";
import { MasterControls } from "./MasterControls";
import { TrackControlsGrid } from "./TrackControlsGrid";
import { audioCtx, audioError } from "@/app/audio/audio";
import styles from "./AudioControlPanel.module.scss";
import classNames from "classnames";

export const AudioControlPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [navbarWidth, setNavbarWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Measure navbar controls width on mount and resize
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

  // Fade in after page load
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

  // Calculate widths: collapsed is 85% of navbar, expanded is 100%
  const collapsedWidth = navbarWidth > 0 ? navbarWidth * 0.85 : undefined;
  const expandedWidth = navbarWidth > 0 ? navbarWidth : undefined;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if audio is supported
  const hasAudioSupport = !audioError && audioCtx !== undefined;

  return (
    <>
      {/* Desktop version - below navbar */}
      <div
        className={classNames(styles.desktopContainer, {
          [styles.visible]: isVisible,
        })}
      >
        <Flex
          direction="column"
          gap="12"
          style={{
            width: isExpanded
              ? (expandedWidth ? `${expandedWidth}px` : "100%")
              : (collapsedWidth ? `${collapsedWidth}px` : "85%"),
            margin: "0 auto",
          }}
        >
          {!isExpanded ? (
            <AudioPanelToggle onClick={toggleExpanded} />
          ) : (
            <Flex
              direction="column"
              gap="16"
              padding="16"
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
                  gap="8"
                  padding="16"
                  radius="m"
                  background="neutral-weak"
                  border="neutral-medium"
                >
                  <Text variant="body-default-m" onBackground="neutral-strong">
                    This option requires web audio support from your browser and device. Ensure you have an audio output available and your browser is allowing audio.
                  </Text>
                </Flex>
              ) : (
                <>
                  {/* Master controls */}
                  <MasterControls />

                  {/* Track controls */}
                  <TrackControlsGrid />
                </>
              )}
            </Flex>
          )}
        </Flex>
      </div>

      {/* Mobile version - above navbar */}
      <Flex
        show="s"
        fillWidth
        horizontal="center"
        position="fixed"
        bottom="0"
        zIndex={8}
        className={classNames(styles.mobileContainer, {
          [styles.visible]: isVisible,
        })}
      >
        <Flex
          direction="column"
          gap="12"
          style={{
            width: isExpanded
              ? (expandedWidth ? `${expandedWidth}px` : "100%")
              : (collapsedWidth ? `${collapsedWidth}px` : "85%")
          }}
        >
          {!isExpanded ? (
            <AudioPanelToggle onClick={toggleExpanded} />
          ) : (
            <Flex
              direction="column"
              gap="12"
              padding="12"
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
                  gap="8"
                  padding="12"
                  radius="m"
                  background="neutral-weak"
                  border="neutral-medium"
                >
                  <Text variant="body-default-s" onBackground="neutral-strong">
                    This option requires web audio support from your browser and device. Ensure you have an audio output available and your browser is allowing audio.
                  </Text>
                </Flex>
              ) : (
                <>
                  {/* Master controls */}
                  <MasterControls />

                  {/* Track controls */}
                  <TrackControlsGrid />
                </>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  );
};
