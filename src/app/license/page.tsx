import { license } from "@/app/resources/content";
import { baseURL } from "@/app/resources";

// FIXME: Make page with license references!
export async function generateMetadata() {
  const title = license.title;
  const description = license.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}/license`,
    },
  };
}

export default function License() {
  return <>FIXME: ADD REFS!</>;
}
