import React from "react";
import { Document } from "react-pdf";
import { baseURL } from "@/app/resources";
import { resume } from "@/app/resources/content";
import { pdfjs } from "react-pdf";

// TODO: Investigate using a locally generated worker
/*pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();*/
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
console.log("here resume page");
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
  console.log("here resume func");
  return (
    <>
      <Document file="docs/Preston-Johnson-Resume.pdf" />
      TEST
    </>
  );
}
