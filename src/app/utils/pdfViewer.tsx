"use client";

import React, { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";

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
 */
export default function PdfViewer({ pdfUrl }: IPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useEffect(() => {
    // TODO: Investigate using a locally generated worker
    /*pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();*/
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  return (
    <Document file={pdfUrl}>
      <Page pageNumber={1} />
    </Document>
  );
}
