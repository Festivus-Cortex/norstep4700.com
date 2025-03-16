import React from "react";
import { pdfjs } from "react-pdf";

console.log("here index");
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
