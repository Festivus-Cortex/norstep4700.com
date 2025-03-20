"use client";

import React, { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import styles from "./pdfViewer.module.css";
/**
 * Props for the PdfViewer component.
 */
interface IPdfViewerProps {
  /**
   * The URL of the PDF to display.
   */
  pdfUrl: string;
}

/**
 * Generic pdf viewing component for modern browsers.
 * Leverages the react-pdf library to render the PDF.
 *
 * @param pdfProps The properties for the PdfViewer component.
 */
export default function PdfViewer(pdfProps: IPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useEffect(() => {
    // Use server copy of worker. Copied during postinstall of the package.
    pdfjs.GlobalWorkerOptions.workerSrc = "/scripts/pdf.worker.min.mjs";

    // Use CDN copy of worker.
    // pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  return (
    <div className={styles.pdfContainer}>
      <Document file={pdfProps.pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (element, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}
