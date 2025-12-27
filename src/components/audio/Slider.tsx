"use client";

import React, { forwardRef, useCallback, useRef } from "react";
import { Flex, Text } from "@/once-ui/components";
import styles from "./Slider.module.scss";
import classNames from "classnames";

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  mode?: "volume" | "pan";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 1,
      step = 0.01,
      label,
      mode = "volume",
      disabled = false,
      className,
      style,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const sliderRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    // Calculate percentage for visual fill
    const percentage = ((value - min) / (max - min)) * 100;

    // For pan mode, calculate fill differently (center-based)
    const panFillStyle =
      mode === "pan"
        ? value >= 0
          ? {
              left: "50%",
              width: `${percentage / 2}%`,
            }
          : {
              left: `${50 + percentage / 2}%`,
              width: `${Math.abs(percentage / 2)}%`,
            }
        : {};

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
            aria-label={label || (mode === "pan" ? "Pan" : "Volume")}
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
              [styles.panMode]: mode === "pan",
            })}
            style={
              mode === "pan"
                ? panFillStyle
                : { width: `${percentage}%` }
            }
          />
          {mode === "pan" && <div className={styles.panCenter} />}
        </Flex>
      </Flex>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
