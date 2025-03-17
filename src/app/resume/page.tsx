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
    <div>
      <div>
        <h3>
          <a href="docs/Preston-Johnson-Resume.pdf" download>
            Download a Copy
          </a>
        </h3>
      </div>
      <br />
      <div>
        <PdfViewer pdfUrl="docs/Preston-Johnson-Resume.pdf" />
      </div>
    </div>
  );
}
