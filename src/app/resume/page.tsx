import React from "react";
import { baseURL } from "@/app/resources";
import { resume } from "@/app/resources/content";
import { Column } from "@/once-ui/components";
import ResumeViewer from "@/components/resume/ResumeViewer";
import { ResumeDownloadBar } from "@/components/resume/ResumeDownloadBar";

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
  const defaultFile =
    resume.versions.find((v) => v.value === resume.defaultVersion)?.file ??
    resume.versions[0].file;

  return (
    <>
      {/* Fixed download bar sits below the audio controls, desktop only */}
      <ResumeDownloadBar href={`/${defaultFile}`} />
      {/* Extra top padding so the PDF content starts below the download bar on initial load */}
      <Column maxWidth="m" gap="m" style={{ paddingTop: "56px" }}>
        <ResumeViewer versions={resume.versions} defaultVersion={resume.defaultVersion} />
      </Column>
    </>
  );
}
