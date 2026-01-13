import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  productionBrowserSourceMaps: false,

  // Ensure there is a full standalone build with dependencies included.
  output: "standalone",

  webpack: (config, { isServer }) => {
    // Use legacy pdfjs-dist build for Node.js environments (standalone builds)
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "pdfjs-dist": "pdfjs-dist/legacy/build/pdf.mjs",
      };
    }
    return config;
  },
};

export default withMDX(nextConfig);
