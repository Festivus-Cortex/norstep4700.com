"use client";

import React, { forwardRef, useCallback, useRef } from "react";
import { Flex, Text } from "@/once-ui/components";
import styles from "./Slider.module.scss";
import classNames from "classnames";

/**
 * Props for the Slider component.
 *
 * The Slider automatically detects whether it should be unidirectional or bidirectional
 * based on the min/max range and optional centerPoint.
 */
export interface SliderProps {
  /** Current value of the slider */
  value: number;

  /** Callback fired when the slider value changes */
  onChange: (value: number) => void;

  /**
   * Minimum value of the slider range.
   * @default 0
   */
  min?: number;

  /**
   * Maximum value of the slider range.
   * @default 1
   */
  max?: number;

  /**
   * Step increment for slider values.
   * @default 0.01
   */
  step?: number;

  /** Optional label displayed above the slider */
  label?: string;

  /**
   * Optional zero/center point for bidirectional fills.
   *
   * If not provided, the center point is automatically inferred:
   * - For ranges spanning negative to positive (e.g., -1 to 1): center is 0
   * - For ranges starting at 0 or positive (e.g., 0 to 1): center is min (standard left-to-right fill)
   *
   * Examples:
   * - Pan slider (min=-1, max=1): Automatically bidirectional with center at 0
   * - Volume slider (min=0, max=1): Automatically unidirectional filling from left
   * - Custom slider (min=0, max=1, centerPoint=0.25): Bidirectional filling from 0.25
   */
  centerPoint?: number;

  /**
   * Whether the slider is disabled.
   * @default false
   */
  disabled?: boolean;

  /** Optional CSS class name */
  className?: string;

  /** Optional inline styles */
  style?: React.CSSProperties;
}

/**
 * A flexible slider component for numeric value input.
 *
 * Automatically adapts between unidirectional and bidirectional modes:
 * - **Unidirectional**: Standard slider filling from left to right (e.g., volume controls)
 * - **Bidirectional**: Slider filling from a center point outward in either direction (e.g., pan controls)
 *
 * The mode is automatically detected based on the min/max range, or can be explicitly
 * controlled via the centerPoint prop.
 *
 * @example
 * // Volume slider (unidirectional)
 * <Slider value={0.5} onChange={setVolume} min={0} max={1} label="Volume" />
 *
 * @example
 * // Pan slider (bidirectional, auto-detected)
 * <Slider value={0} onChange={setPan} min={-1} max={1} label="Pan" />
 *
 * @example
 * // Custom bidirectional slider with explicit center
 * <Slider value={0.5} onChange={setValue} min={0} max={1} centerPoint={0.5} label="Balance" />
 */
const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 1,
      step = 0.01,
      label,
      centerPoint,
      disabled = false,
      className,
      style,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const sliderRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    /**
     * Infer center point if not explicitly provided.
     *
     * Logic:
     * - If range spans negative to positive (e.g., -1 to 1): center is 0
     * - Otherwise: center is at min (standard left-to-right fill)
     */
    const inferredCenter = centerPoint ?? (min < 0 && max > 0 ? 0 : min);

    /**
     * Determine if this is a bidirectional slider.
     * True when the center point falls between min and max (not at the edges).
     */
    const isBidirectional = inferredCenter > min && inferredCenter < max;

    /**
     * Calculate percentage position of current value (0-100%).
     * Used for unidirectional fill width.
     */
    const percentage = ((value - min) / (max - min)) * 100;

    /**
     * Calculate percentage position of center point (0-100%).
     * Used for bidirectional center marker and fill calculations.
     */
    const centerPercentage = ((inferredCenter - min) / (max - min)) * 100;

    /**
     * Calculate fill style for bidirectional mode.
     *
     * When value >= center: Fill extends right from center
     * When value < center: Fill extends left from value to center
     */
    const bidirectionalFillStyle = isBidirectional
      ? value >= inferredCenter
        ? {
            // Fill to the right of center
            left: `${centerPercentage}%`,
            width: `${((value - inferredCenter) / (max - min)) * 100}%`,
          }
        : {
            // Fill to the left of center
            left: `${((value - min) / (max - min)) * 100}%`,
            width: `${((inferredCenter - value) / (max - min)) * 100}%`,
          }
      : {};

    /**
     * Handle slider input change events.
     * Parses the new value and calls the onChange callback.
     */
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(event.target.value);
        onChange(newValue);
      },
      [onChange]
    );

    return (
      <Flex direction="column" gap="4" className={className} style={style}>
        {label && <Text variant="label-default-s">{label}</Text>}
        <Flex className={styles.sliderContainer} position="relative">
          <input
            ref={sliderRef}
            type="range"
            className={styles.slider}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            aria-label={label || "Slider"}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
          />
          <div
            className={classNames(styles.sliderTrack, {
              [styles.disabled]: disabled,
            })}
          />
          <div
            className={classNames(styles.sliderFill, {
              [styles.disabled]: disabled,
              [styles.bidirectional]: isBidirectional,
            })}
            style={
              isBidirectional
                ? bidirectionalFillStyle
                : { width: `${percentage}%` }
            }
          />
          {isBidirectional && (
            <div
              className={styles.centerMarker}
              style={{ left: `${centerPercentage}%` }}
            />
          )}
        </Flex>
      </Flex>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
