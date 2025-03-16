import React from "react";
import { baseURL } from "@/app/resources";
import { resume } from "@/app/resources/content";
import PdfViewer from "../utils/pdfViewer";

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

export default function Resume() {
  return (
    <>
      <h2>
        <a href="docs/Preston-Johnson-Resume.pdf">
          "FIXME: INSERT DOWNLOAD LINK
        </a>
      </h2>
      <PdfViewer pdfUrl="docs/Preston-Johnson-Resume.pdf" />
    </>
  );
}
