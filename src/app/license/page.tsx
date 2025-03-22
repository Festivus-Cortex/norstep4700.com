import { license } from "@/app/resources/content";
import { baseURL } from "@/app/resources";
import { Column, Heading, SmartLink, Text } from "@/once-ui/components";
import { Header } from "@/components";

/**
 * Generate the metadata for the license page.
 */
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

/**
 * The license page content.
 */
export default function License() {
  // FIXME: Correct the font display of smart links so they stand out properly.
  return (
    <Column width="m" gap="m" marginBottom="40" onBackground="brand-medium">
      <Heading>Grateful for help from...</Heading>
      <Text variant="body-default-l">
        This portfolio was built on a template site created by the authors of
        <SmartLink href="https://once-ui.com/templates/magic-portfolio">
          Once UI
        </SmartLink>
        and using their lovely component system. This is used under the
        <SmartLink
          href="https://creativecommons.org/licenses/by-nc/4.0/legalcode"
          style={{ textDecoration: "underline" }}
        >
          CC BY-NC 4.0
        </SmartLink>
        license.
        <SmartLink
          href="https://github.com/once-ui-system/magic-portfolio.git"
          style={{ textDecoration: "underline" }}
        >
          Check out the original template!
        </SmartLink>
      </Text>
      <Text variant="body-default-m">
        AI chat bots like Co-Pilot were used to help educate me on various
        topics like next.js and extend the functionality of the site. Unless
        otherwise stated inline, no media has been AI generated.
      </Text>
    </Column>
  );
}
