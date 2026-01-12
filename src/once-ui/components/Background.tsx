"use client";

import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
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
  GradientTiltAnimatorOutput,
  GradientTiltAnimatorParams,
  GradientScaleAnimatorOutput,
  GradientScaleAnimatorParams,
  GradientPositionAnimatorOutput,
  GradientPositionAnimatorParams,
  ElementOpacityAnimatorOutput,
  ElementOpacityAnimatorParams,
  MovementStyle,
} from "@/effect/animators";
import { useEffectRef, useEffectSubscription } from "@/hooks/effect";
import { useAudioState } from "@/context/AudioStateContext";

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

/**
 * Configuration for audio-reactive gradient tilt effects.
 */
interface AudioReactiveGradientTiltProps {
  enabled: boolean;
  intensity?: EffectIntensity;
  audioAnalysisSource?: AudioAnalysisSource;
  baseTilt?: number;
  minTilt?: number;
  maxTilt?: number;
  smoothing?: number;
  oscillate?: boolean;
}

/**
 * Configuration for audio-reactive gradient scale effects.
 */
interface AudioReactiveGradientScaleProps {
  enabled: boolean;
  intensity?: EffectIntensity;
  audioAnalysisSource?: AudioAnalysisSource;
  baseWidth?: number;
  baseHeight?: number;
  minScale?: number;
  maxScale?: number;
  smoothing?: number;
  aspectLock?: boolean;
}

/**
 * Configuration for audio-reactive gradient position effects.
 */
interface AudioReactiveGradientPositionProps {
  enabled: boolean;
  intensity?: EffectIntensity;
  audioAnalysisSource?: AudioAnalysisSource;
  baseX?: number;
  baseY?: number;
  maxDeviation?: number;
  smoothing?: number;
  peakThreshold?: number;
  peakDecay?: number;
  movementStyle?: MovementStyle;
}

/**
 * Configuration for audio-reactive element opacity effects.
 */
interface AudioReactiveElementOpacityProps {
  enabled: boolean;
  intensity?: EffectIntensity;
  audioAnalysisSource?: AudioAnalysisSource;
  baseOpacity?: number;
  minOpacity?: number;
  maxOpacity?: number;
  smoothing?: number;
}

export interface BackgroundProps extends React.ComponentProps<typeof Flex> {
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
  /** Enable audio-reactive gradient tilt effects */
  audioReactiveGradientTilt?: AudioReactiveGradientTiltProps;
  /** Enable audio-reactive gradient scale effects */
  audioReactiveGradientScale?: AudioReactiveGradientScaleProps;
  /** Enable audio-reactive gradient position effects */
  audioReactiveGradientPosition?: AudioReactiveGradientPositionProps;
  /** Enable audio-reactive element opacity effects */
  audioReactiveElementOpacity?: AudioReactiveElementOpacityProps;
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
      audioReactiveGradientTilt,
      audioReactiveGradientScale,
      audioReactiveGradientPosition,
      audioReactiveElementOpacity,
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

    // Create effect subscription when audio reactive mask is enabled
    // Config params are already merged in BackgroundWithConfig wrapper
    useEffectSubscription<MaskRadiusAnimatorParams, MaskRadiusAnimatorOutput>({
      type: "maskRadiusAnimator",
      id: effectId,
      params: audioReactiveMask?.enabled ? audioReactiveMask : undefined,
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

    // Set up audio-reactive gradient tilt effect
    const gradientTiltEffectId = "background-gradient-tilt-effect";
    useEffectSubscription<GradientTiltAnimatorParams, GradientTiltAnimatorOutput>({
      type: "gradientTiltAnimator",
      id: gradientTiltEffectId,
      params: audioReactiveGradientTilt?.enabled ? audioReactiveGradientTilt : undefined,
      autoStart:
        isEffectConfigInitialized && (audioReactiveGradientTilt?.enabled ?? false),
    });

    // Set up audio-reactive gradient scale effect
    const gradientScaleEffectId = "background-gradient-scale-effect";
    useEffectSubscription<GradientScaleAnimatorParams, GradientScaleAnimatorOutput>({
      type: "gradientScaleAnimator",
      id: gradientScaleEffectId,
      params: audioReactiveGradientScale?.enabled ? audioReactiveGradientScale : undefined,
      autoStart:
        isEffectConfigInitialized && (audioReactiveGradientScale?.enabled ?? false),
    });

    // Set up audio-reactive gradient position effect
    const gradientPositionEffectId = "background-gradient-position-effect";
    useEffectSubscription<GradientPositionAnimatorParams, GradientPositionAnimatorOutput>({
      type: "gradientPositionAnimator",
      id: gradientPositionEffectId,
      params: audioReactiveGradientPosition?.enabled ? audioReactiveGradientPosition : undefined,
      autoStart:
        isEffectConfigInitialized && (audioReactiveGradientPosition?.enabled ?? false),
    });

    // Set up audio-reactive element opacity effect
    const elementOpacityEffectId = "background-element-opacity-effect";
    useEffectSubscription<ElementOpacityAnimatorParams, ElementOpacityAnimatorOutput>({
      type: "elementOpacityAnimator",
      id: elementOpacityEffectId,
      params: audioReactiveElementOpacity?.enabled ? audioReactiveElementOpacity : undefined,
      autoStart:
        isEffectConfigInitialized && (audioReactiveElementOpacity?.enabled ?? false),
    });

    // Gradient effect ref - applies tilt
    const gradientRef = useEffectRef<GradientTiltAnimatorOutput>(
      gradientTiltEffectId,
      (element, values) => {
        element.style.setProperty("--gradient-tilt", values.cssTilt);
      }
    );

    // Gradient scale effect ref
    const gradientScaleRef = useEffectRef<GradientScaleAnimatorOutput>(
      gradientScaleEffectId,
      (element, values) => {
        element.style.setProperty("--gradient-width", values.cssWidth);
        element.style.setProperty("--gradient-height", values.cssHeight);
      }
    );

    // Gradient position effect ref
    const gradientPositionRef = useEffectRef<GradientPositionAnimatorOutput>(
      gradientPositionEffectId,
      (element, values) => {
        element.style.setProperty("--gradient-position-x", values.cssX);
        element.style.setProperty("--gradient-position-y", values.cssY);
      }
    );

    // Element opacity effect ref
    const elementOpacityRef = useEffectRef<ElementOpacityAnimatorOutput>(
      elementOpacityEffectId,
      (element, values) => {
        element.style.opacity = String(values.normalizedOpacity);
      }
    );

    // Store refs in a mutable ref to avoid recreating callback when ref functions change
    const gradientRefsRef = useRef({ gradientRef, gradientScaleRef, gradientPositionRef });
    gradientRefsRef.current = { gradientRef, gradientScaleRef, gradientPositionRef };

    // Combined ref callback for gradient element - stable callback
    const gradientRefCallback = useCallback((element: HTMLDivElement | null) => {
      if (!element) return;
      const refs = gradientRefsRef.current;
      if (audioReactiveGradientTilt?.enabled) {
        refs.gradientRef(element);
      }
      if (audioReactiveGradientScale?.enabled) {
        refs.gradientScaleRef(element);
      }
      if (audioReactiveGradientPosition?.enabled) {
        refs.gradientPositionRef(element);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioReactiveGradientTilt?.enabled, audioReactiveGradientScale?.enabled, audioReactiveGradientPosition?.enabled]);

    // Store element opacity ref in a mutable ref
    const elementRefsRef = useRef({ elementOpacityRef });
    elementRefsRef.current = { elementOpacityRef };

    // Combined ref callback for element (dots) opacity
    const elementOpacityRefCallback = useCallback((element: HTMLDivElement | null) => {
      if (!element) return;
      if (audioReactiveElementOpacity?.enabled) {
        elementRefsRef.current.elementOpacityRef(element);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioReactiveElementOpacity?.enabled]);

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
            ref={gradientRefCallback}
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
            ref={elementOpacityRefCallback}
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
