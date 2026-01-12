"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Client-side component that automatically scrolls to the element matching the URL hash on page load.
 *
 * This component watches for URL changes and smoothly scrolls to any element with an ID
 * matching the hash portion of the URL (e.g., #section-name).
 *
 * @returns null - This component renders nothing visible
 */
export default function ScrollToHash() {
  const router = useRouter();

  useEffect(() => {
    // Get the hash from the URL
    const hash = window.location.hash;
    if (hash) {
      // Remove the '#' symbol
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [router]);

  return null;
}
