"use client";

import Masonry from "react-masonry-css";
import { SmartImage } from "@/once-ui/components";
import styles from "./Gallery.module.scss";
import { gallery } from "@/app/resources/content";

/**
 * Responsive masonry grid layout for displaying gallery images.
 *
 * This component uses react-masonry-css to create a Pinterest-style grid that:
 * - Adapts column count based on viewport width (1-4 columns)
 * - Prioritizes loading the first 10 images for better performance
 * - Respects image orientation (horizontal vs vertical)
 * - Provides responsive image sizing with appropriate srcset
 *
 * Breakpoints:
 * - Default (≥1440px): 4 columns
 * - 1440px: 3 columns
 * - 1024px: 2 columns
 * - 560px: 1 column
 */
export default function MasonryGrid() {
  const breakpointColumnsObj = {
    default: 4,
    1440: 3,
    1024: 2,
    560: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className={styles.masonryGrid}
      columnClassName={styles.masonryGridColumn}
    >
      {gallery.images.map((image, index) => (
        <SmartImage
          priority={index < 10}
          sizes="(max-width: 560px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
          key={index}
          radius="m"
          aspectRatio={image.orientation === "horizontal" ? "16 / 9" : "9 / 16"}
          src={image.src}
          alt={image.alt}
          className={styles.gridItem}
        />
      ))}
    </Masonry>
  );
}
