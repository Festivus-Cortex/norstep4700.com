import React from "react";
import { baseURL } from "@/app/resources";
import { resume } from "@/app/resources/content";
import { Column } from "@/once-ui/components";
import ResumeViewer from "@/components/resume/ResumeViewer";

/**
 * Generate the metadata for the resume page.
 */
export async function generateMetadata() {
  const title = resume.title;
  const description = resume.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}/resume`,
    },
  };
}

/**
 * The resume page content.
 */
export default function Resume() {
  return (
    <Column maxWidth="m" gap="m">
      <ResumeViewer versions={resume.versions} defaultVersion={resume.defaultVersion} />
    </Column>
  );
}
