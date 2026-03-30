"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Column, Heading, Row, SegmentedControl, Spinner } from "@/once-ui/components";

// Dynamically import PdfViewer with SSR disabled — react-pdf uses browser-only
// APIs (canvas, workers) that cause hydration mismatches when server-rendered.
const PdfViewer = dynamic(() => import("@/components/utils/PdfViewer"), {
  ssr: false,
  loading: () => (
    <Column horizontal="center" padding="xl">
      <Spinner />
    </Column>
  ),
});

interface ResumeVersion {
  label: string;
  value: string;
  file: string;
}

interface ResumeViewerProps {
  versions: ResumeVersion[];
  defaultVersion: string;
}

export default function ResumeViewer({ versions, defaultVersion }: ResumeViewerProps) {
  const [selected, setSelected] = useState(defaultVersion);

  const current = versions.find((v) => v.value === selected) ?? versions[0];

  return (
    <Column gap="m">
      {/* Resume variant selector — intentionally disabled for now.
          Showing only the Game Dev resume by default. Code preserved here
          so multi-resume support can be re-enabled in the future if needed. */}
      {false && (
        <Row horizontal="center">
          <SegmentedControl
            buttons={versions.map((v) => ({ label: v.label, value: v.value }))}
            defaultSelected={defaultVersion}
            onToggle={(value) => setSelected(value)}
          />
        </Row>
      )}
      <Column center>
        <Heading variant="display-strong-s">
          <a href={current.file} download>
            Download a Copy
          </a>
        </Heading>
      </Column>
      <Column overflow="visible">
        <PdfViewer pdfUrl={current.file} />
      </Column>
    </Column>
  );
}
