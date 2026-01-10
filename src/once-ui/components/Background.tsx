"use client";

import React, {
  CSSProperties,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SpacingToken } from "../types";
import { Flex } from "./Flex";
import { DisplayProps } from "../interfaces";
import styles from "./Background.module.scss";
import classNames from "classnames";
import { AudioAnalysisSource, EffectIntensity } from "@/effect/core/types";
import {
  MaskRadiusAnimatorOutput,
  MaskRadiusAnimatorParams,
} from "@/effect/animators";
import { useEffectRef, useEffectSubscription } from "@/hooks/effect";
import { useAudioState } from "@/context/AudioStateContext";
import { getEffectDefaults } from "@/effect/config/loader";

// NOTE: Be cautious about what is imported. Ensure no imports come from
// /src/app or /src/component

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && "current" in ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

interface MaskProps {
  cursor?: boolean;
  x?: number;
  y?: number;
  radius?: number;
}

interface GradientProps {
  display?: boolean;
  opacity?: DisplayProps["opacity"];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  tilt?: number;
  colorStart?: string;
  colorEnd?: string;
}

interface DotsProps {
  display?: boolean;
  opacity?: DisplayProps["opacity"];
  color?: string;
  size?: SpacingToken;
}

interface GridProps {
  display?: boolean;
  opacity?: DisplayProps["opacity"];
  color?: string;
  width?: string;
  height?: string;
}

interface LinesProps {
  display?: boolean;
  opacity?: DisplayProps["opacity"];
  size?: SpacingToken;
}

/**
 * Configuration for audio-reactive mask effects.
 * All params except 'enabled' are optional and will use config defaults if not provided.
 */
interface AudioReactiveMaskProps {
  /** Enable audio-reactive mask radius */
  enabled: boolean;
  /** Effect intensity level (optional, uses config default if not provided) */
  intensity?: EffectIntensity;
  /** Which audio metric drives the effect (optional, uses config default if not provided) */
  audioAnalysisSource?: AudioAnalysisSource;
  /** Base radius in vh (optional, uses config default if not provided) */
  baseRadius?: number;
  /** Minimum radius in vh (optional, uses config default if not provided) */
  minRadius?: number;
  /** Maximum radius in vh (optional, uses config default if not provided) */
  maxRadius?: number;
  /** Smoothing factor (optional, uses config default if not provided) */
  smoothing?: number;
}

interface BackgroundProps extends React.ComponentProps<typeof Flex> {
  position?: CSSProperties["position"];
  gradient?: GradientProps;
  dots?: DotsProps;
  grid?: GridProps;
  lines?: LinesProps;
  mask?: MaskProps;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Enable audio-reactive mask effects */
  audioReactiveMask?: AudioReactiveMaskProps;
}

const Background = forwardRef<HTMLDivElement, BackgroundProps>(
  (
    {
      position = "fixed",
      gradient = {},
      dots = {},
      grid = {},
      lines = {},
      mask = {},
      children,
      className,
      style,
      audioReactiveMask,
      ...rest
    },
    forwardedRef
  ) => {
    const dotsColor = dots.color ?? "brand-on-background-weak";
    const dotsSize = "var(--static-space-" + (dots.size ?? "24") + ")";

    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
    const backgroundRef = useRef<HTMLDivElement>(null);
    const { isEffectConfigInitialized } = useAudioState();

    // Set up audio-reactive mask effect if enabled
    const effectId = "background-mask-effect";

    // Get config params for defaults - only when initialized
    const configParams = useMemo(() => {
      if (!isEffectConfigInitialized) return null;
      return getEffectDefaults("maskRadiusAnimator");
    }, [isEffectConfigInitialized]);

    // Merge config params with prop overrides (props take precedence)
    const effectParams = useMemo(() => {
      if (!audioReactiveMask?.enabled || !configParams) return undefined;

      return {
        ...configParams,
        ...audioReactiveMask,
        enabled: true,
      };
    }, [audioReactiveMask, configParams]);

    // Create effect subscription when audio reactive mask is enabled
    // Pass merged params (config defaults + prop overrides)
    useEffectSubscription<MaskRadiusAnimatorParams, MaskRadiusAnimatorOutput>({
      type: "maskRadiusAnimator",
      id: effectId,
      params: effectParams,
      autoStart:
        isEffectConfigInitialized && (audioReactiveMask?.enabled ?? false),
    });

    // Use direct DOM manipulation for performance (no React re-renders)
    const audioMaskRef = useEffectRef<MaskRadiusAnimatorOutput>(
      effectId,
      (element, values) => {
        element.style.setProperty("--mask-radius", values.cssRadius);
      }
    );

    // Combine refs: backgroundRef for internal use, forwardedRef for external, audioMaskRef for effects
    const combinedRefCallback = (element: HTMLDivElement | null) => {
      // Update internal ref
      (backgroundRef as React.MutableRefObject<HTMLDivElement | null>).current =
        element;
      // Forward to external ref
      setRef(forwardedRef, element);
      // Apply audio effect ref if enabled
      if (audioReactiveMask?.enabled && element) {
        audioMaskRef(element);
      }
    };

    useEffect(() => {
      setRef(forwardedRef, backgroundRef.current);
    }, [forwardedRef]);

    useEffect(() => {
      const handleMouseMove = (event: MouseEvent) => {
        if (backgroundRef.current) {
          const rect = backgroundRef.current.getBoundingClientRect();
          setCursorPosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }
      };

      document.addEventListener("mousemove", handleMouseMove);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }, []);

    useEffect(() => {
      let animationFrameId: number;

      const updateSmoothPosition = () => {
        setSmoothPosition((prev) => {
          const dx = cursorPosition.x - prev.x;
          const dy = cursorPosition.y - prev.y;
          const easingFactor = 0.05;

          return {
            x: Math.round(prev.x + dx * easingFactor),
            y: Math.round(prev.y + dy * easingFactor),
          };
        });
        animationFrameId = requestAnimationFrame(updateSmoothPosition);
      };

      if (mask.cursor) {
        animationFrameId = requestAnimationFrame(updateSmoothPosition);
      }

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [cursorPosition, mask]);

    const maskStyle = (): CSSProperties => {
      if (!mask) return {};

      if (mask.cursor) {
        return {
          "--mask-position-x": `${smoothPosition.x}px`,
          "--mask-position-y": `${smoothPosition.y}px`,
          "--mask-radius": `${mask.radius || 50}vh`,
        } as CSSProperties;
      }

      if (mask.x != null && mask.y != null) {
        return {
          "--mask-position-x": `${mask.x}%`,
          "--mask-position-y": `${mask.y}%`,
          "--mask-radius": `${mask.radius || 50}vh`,
        } as CSSProperties;
      }

      return {};
    };

    const remap = (
      value: number,
      inputMin: number,
      inputMax: number,
      outputMin: number,
      outputMax: number
    ) => {
      return (
        ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) +
        outputMin
      );
    };

    const adjustedX =
      gradient.x != null ? remap(gradient.x, 0, 100, 37.5, 62.5) : 50;
    const adjustedY =
      gradient.y != null ? remap(gradient.y, 0, 100, 37.5, 62.5) : 50;

    return (
      <Flex
        ref={combinedRefCallback}
        fill
        position={position}
        className={classNames(mask && styles.mask, className)}
        top="0"
        left="0"
        zIndex={0}
        overflow="hidden"
        style={{
          ...maskStyle(),
          ...style,
        }}
        {...rest}
      >
        {gradient.display && (
          <Flex
            position="absolute"
            className={styles.gradient}
            opacity={gradient.opacity}
            pointerEvents="none"
            style={{
              ["--gradient-position-x" as string]: `${adjustedX}%`,
              ["--gradient-position-y" as string]: `${adjustedY}%`,
              ["--gradient-width" as string]:
                gradient.width != null ? `${gradient.width / 4}%` : "25%",
              ["--gradient-height" as string]:
                gradient.height != null ? `${gradient.height / 4}%` : "25%",
              ["--gradient-tilt" as string]:
                gradient.tilt != null ? `${gradient.tilt}deg` : "0deg",
              ["--gradient-color-start" as string]: gradient.colorStart
                ? `var(--${gradient.colorStart})`
                : "var(--brand-solid-strong)",
              ["--gradient-color-end" as string]: gradient.colorEnd
                ? `var(--${gradient.colorEnd})`
                : "var(--brand-solid-weak)",
            }}
          />
        )}
        {dots.display && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            fill
            pointerEvents="none"
            className={styles.dots}
            opacity={dots.opacity}
            style={
              {
                "--dots-color": `var(--${dotsColor})`,
                "--dots-size": dotsSize,
              } as React.CSSProperties
            }
          />
        )}
        {lines.display && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            fill
            pointerEvents="none"
            className={styles.lines}
            opacity={lines.opacity}
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, var(--brand-on-background-weak) 0, var(--brand-on-background-weak) 0.5px, var(--static-transparent) 0.5px, var(--static-transparent) ${dots.size})`,
            }}
          />
        )}
        {grid.display && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            fill
            pointerEvents="none"
            className={styles.grid}
            opacity={grid.opacity}
            style={{
              backgroundSize: `
                ${grid.width || "var(--static-space-32)"}
                ${grid.height || "var(--static-space-32)"}`,
              backgroundPosition: "0 0",
              backgroundImage: `
                linear-gradient(
                  90deg,
                  var(--${grid.color || "brand-on-background-weak"}) 0,
                  var(--${grid.color || "brand-on-background-weak"}) 1px,
                  var(--static-transparent) 1px,
                  var(--static-transparent) ${
                    grid.width || "var(--static-space-32)"
                  }
                ),
                linear-gradient(
                  0deg,
                  var(--${grid.color || "brand-on-background-weak"}) 0,
                  var(--${grid.color || "brand-on-background-weak"}) 1px,
                  var(--static-transparent) 1px,
                  var(--static-transparent) ${
                    grid.height || "var(--static-space-32)"
                  }
                )
              `,
            }}
          />
        )}
        {children}
      </Flex>
    );
  }
);

Background.displayName = "Background";

export { Background };
