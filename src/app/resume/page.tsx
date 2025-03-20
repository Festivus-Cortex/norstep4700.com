import React from "react";
import { baseURL } from "@/app/resources";
import { resume } from "@/app/resources/content";
import PdfViewer from "../../components/utils/pdfViewer";
import { Column, Heading, SmartLink } from "@/once-ui/components";

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
      <Column center>
        <Heading variant="display-strong-s">
          {/*The "download" flag is not respected properly with a "SmartLink". Therefore use the native 'a' tag.*/}
          <a href="docs/Preston-Johnson-Resume.pdf" download>
            Download a Copy
          </a>
        </Heading>
      </Column>
      <Column>
        <PdfViewer pdfUrl="docs/Preston-Johnson-Resume.pdf" />
      </Column>
    </Column>
  );
}
