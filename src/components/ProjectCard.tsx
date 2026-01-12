"use client";

import {
  AvatarGroup,
  Carousel,
  Column,
  Flex,
  Heading,
  SmartLink,
  Text,
} from "@/once-ui/components";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: { src: string; alt: string; width?: number; height?: number }[];
  title: string;
  content: string;
  description: string;
  avatars: { src: string }[];
  link: string;
}

/**
 * Displays a project card with image carousel, title, description, team avatars, and action links.
 *
 * This component is used on the work/projects listing page to showcase individual projects.
 * It includes:
 * - An image carousel showing project screenshots
 * - Project title and description
 * - Team member avatars
 * - "Read more" link to the full project page
 * - Optional external link for live demos or repositories
 *
 * @param href - Internal link to the full project page
 * @param priority - Whether images should be loaded with priority
 * @param images - Array of images for the carousel
 * @param title - Project title
 * @param content - Project content (used to determine if "Read more" should show)
 * @param description - Short project description
 * @param avatars - Team member avatar images
 * @param link - Optional external link (e.g., live demo, GitHub repo)
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  images = [],
  title,
  content,
  description,
  avatars,
  link,
}) => {
  return (
    <Column fillWidth gap="m">
      <Carousel
        sizes="(max-width: 960px) 100vw, 960px"
        images={images.map((image) => ({
          src: image.src,
          alt: image.alt,
          width: image.width,
          height: image.height,
        }))}
      />
      <Flex
        mobileDirection="column"
        fillWidth
        paddingX="s"
        paddingTop="12"
        paddingBottom="24"
        gap="l"
      >
        {title && (
          <Flex flex={5}>
            <Heading as="h2" wrap="balance" variant="heading-strong-xl">
              {title}
            </Heading>
          </Flex>
        )}
        {(avatars?.length > 0 || description?.trim() || content?.trim()) && (
          <Column flex={7} gap="16">
            {avatars?.length > 0 && (
              <AvatarGroup avatars={avatars} size="m" reverse />
            )}
            {description?.trim() && (
              <Text
                wrap="balance"
                variant="body-default-s"
                onBackground="neutral-weak"
              >
                {description}
              </Text>
            )}
            <Flex gap="24" wrap>
              {content?.trim() && (
                <SmartLink
                  suffixIcon="arrowRight"
                  style={{ margin: "0", width: "fit-content" }}
                  href={href}
                >
                  <Text variant="body-default-s">Read more</Text>
                </SmartLink>
              )}
              {link && (
                <SmartLink
                  suffixIcon="arrowUpRightFromSquare"
                  style={{ margin: "0", width: "fit-content" }}
                  href={link}
                >
                  <Text variant="body-default-s">View external content</Text>
                </SmartLink>
              )}
            </Flex>
          </Column>
        )}
      </Flex>
    </Column>
  );
};
