// FIXME: Make page - see notes from copilot about `react-pdf`
import React from "react";
import { Document } from "react-pdf";
import { baseURL } from "@/app/resources";
import { resume } from "@/app/resources/content";

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
  return <Document file="docs/Preston-Johnson-Resume.pdf" />;
}
