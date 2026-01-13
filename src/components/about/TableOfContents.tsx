"use client";

import React from "react";
import { Column, Flex, Text } from "@/once-ui/components";
import styles from "./about.module.scss";

interface TableOfContentsProps {
  structure: {
    title: string;
    display: boolean;
    items: string[];
  }[];
  about: {
    tableOfContent: {
      display: boolean;
      subItems: boolean;
    };
  };
}

/**
 * Fixed-position table of contents component for the about page.
 *
 * This component displays a hierarchical navigation menu on the left side of the viewport
 * (hidden on mobile/medium screens). Users can click on section titles or sub-items
 * to smoothly scroll to the corresponding content.
 *
 * Features:
 * - Smooth scroll navigation with 80px offset for fixed headers
 * - Optional sub-item display controlled by configuration
 * - Automatically filters out sections marked as not displayable
 * - Vertically centered in the viewport
 *
 * @param structure - Array of sections with titles, display flags, and items
 * @param about - Configuration object controlling table of contents visibility and sub-items
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({
  structure,
  about,
}) => {
  const scrollTo = (id: string, offset: number) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (!about.tableOfContent.display) return null;

  return (
    <Column
      left="0"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        whiteSpace: "nowrap",
      }}
      position="fixed"
      paddingLeft="24"
      gap="32"
      hide="m"
    >
      {structure
        .filter((section) => section.display)
        .map((section, sectionIndex) => (
          <Column key={sectionIndex} gap="12">
            <Flex
              cursor="interactive"
              className={styles.hover}
              gap="8"
              vertical="center"
              onClick={() => scrollTo(section.title, 80)}
            >
              <Flex height="1" minWidth="16" background="neutral-strong"></Flex>
              <Text>{section.title}</Text>
            </Flex>
            {about.tableOfContent.subItems && (
              <>
                {section.items.map((item, itemIndex) => (
                  <Flex
                    hide="l"
                    key={itemIndex}
                    style={{ cursor: "pointer" }}
                    className={styles.hover}
                    gap="12"
                    paddingLeft="24"
                    vertical="center"
                    onClick={() => scrollTo(item, 80)}
                  >
                    <Flex
                      height="1"
                      minWidth="8"
                      background="neutral-strong"
                    ></Flex>
                    <Text>{item}</Text>
                  </Flex>
                ))}
              </>
            )}
          </Column>
        ))}
    </Column>
  );
};

export default TableOfContents;
