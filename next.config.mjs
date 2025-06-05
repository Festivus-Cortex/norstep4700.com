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
};

export default withMDX(nextConfig);
