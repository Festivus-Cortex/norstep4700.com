"use client";

import React from "react";
import { Flex, Icon, Text } from "@/once-ui/components";
import styles from "./AudioPanelToggle.module.scss";
import classNames from "classnames";

interface AudioPanelToggleProps {
  onClick: () => void;
  className?: string;
}

export const AudioPanelToggle: React.FC<AudioPanelToggleProps> = ({
  onClick,
  className,
}) => {
  return (
    <Flex
      as="button"
      onClick={onClick}
      className={classNames(styles.toggle, className)}
      paddingX="8"
      paddingY="4"
      gap="4"
      vertical="center"
      horizontal="center"
      radius="m"
      border="neutral-medium"
      background="surface"
      role="button"
      aria-label="Open audio controls"
      tabIndex={0}
    >
      <Icon name="volumeHigh" size="s" />
      <Text variant="body-default-s" onBackground="neutral-strong">
        Audio Controls
      </Text>
      <Icon name="chevronDown" size="s" />
    </Flex>
  );
};
