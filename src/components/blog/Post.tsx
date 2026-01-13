"use client";

import {
  Column,
  Flex,
  Heading,
  SmartImage,
  SmartLink,
  Tag,
  Text,
} from "@/once-ui/components";
import styles from "./Posts.module.scss";
import { formatDate } from "@/utils/formatDate";
import React from "react";

interface PostProps {
  post: any;
  thumbnail: boolean;
}

/**
 * Displays a single blog post preview card with title, date, tags, and optional thumbnail.
 *
 * This component renders an individual blog post in a card format, displaying:
 * - Optional thumbnail image
 * - Post title
 * - Publication date
 * - Up to 3 tags
 *
 * The entire card is clickable and links to the full blog post.
 *
 * @param post - The blog post object containing metadata (title, image, publishedAt, tag) and slug
 * @param thumbnail - Whether to display the post's thumbnail image
 */
export default function Post(postProps: PostProps) {
  const { post, thumbnail } = postProps;

  const tags = post.metadata.tag.split(",").map((tag: string) => tag.trim());

  return (
    <SmartLink
      fillWidth
      className={styles.hover}
      unstyled
      key={post.slug}
      href={`/blog/${post.slug}`}
    >
      <Flex
        position="relative"
        mobileDirection="column"
        fillWidth
        paddingY="12"
        paddingX="16"
        gap="32"
      >
        {post.metadata.image && thumbnail && (
          <SmartImage
            priority
            maxWidth={20}
            className={styles.image}
            sizes="640px"
            border="neutral-alpha-weak"
            cursor="interactive"
            radius="m"
            src={post.metadata.image}
            alt={"Thumbnail of " + post.metadata.title}
            aspectRatio="16 / 9"
          />
        )}
        <Column position="relative" fillWidth gap="8" vertical="center">
          <Heading as="h2" variant="heading-strong-l" wrap="balance">
            {post.metadata.title}
          </Heading>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {post.metadata.publishedAt &&
              formatDate(post.metadata.publishedAt, false)}
          </Text>
          {tags.length > 0 && (
            <Flex gap="8">
              {tags.map((tag: string, index: number) =>
                index < 3 ? (
                  <Tag key={index} label={tag} variant="neutral" />
                ) : null
              )}
            </Flex>
          )}
        </Column>
      </Flex>
    </SmartLink>
  );
}
