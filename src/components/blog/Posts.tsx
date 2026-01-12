import { getPosts } from "@/app/utils/utils";
import { Grid } from "@/once-ui/components";
import Post from "./Post";

interface PostsProps {
  range?: [number] | [number, number];
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
}

/**
 * Displays a grid of blog posts sorted by publication date (newest first).
 *
 * This component fetches blog posts from the file system and renders them in a responsive grid.
 * Posts are automatically sorted by publication date with the most recent posts appearing first.
 *
 * @param range - Optional range of posts to display (e.g., [1, 5] shows posts 1-5, [1] shows all posts starting from 1)
 * @param columns - Number of columns in the grid layout (1, 2, or 3). Defaults to 1. Always uses 1 column on mobile.
 * @param thumbnail - Whether to display post thumbnails. Defaults to false.
 */
export function Posts({ range, columns = "1", thumbnail = false }: PostsProps) {
  let allBlogs = getPosts(["src", "app", "blog", "posts"]);

  const sortedBlogs = allBlogs.sort((a, b) => {
    return (
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
    );
  });

  const displayedBlogs = range
    ? sortedBlogs.slice(
        range[0] - 1,
        range.length === 2 ? range[1] : sortedBlogs.length
      )
    : sortedBlogs;

  return (
    <>
      {displayedBlogs.length > 0 && (
        <Grid
          columns={columns}
          mobileColumns="1"
          fillWidth
          marginBottom="40"
          gap="m"
        >
          {displayedBlogs.map((post) => (
            <Post key={post.slug} post={post} thumbnail={thumbnail} />
          ))}
        </Grid>
      )}
    </>
  );
}
