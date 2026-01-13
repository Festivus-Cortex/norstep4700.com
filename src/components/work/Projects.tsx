import { getPosts, MdxMetadata } from "@/app/utils/utils";
import { Column } from "@/once-ui/components";
import { ProjectCard } from "@/components";

interface ProjectsProps {
  range?: [number, number?];

  /**
   * Allows selection of project by using the title names instead of sorted
   * index.
   */
  byTitle?: string[];
}

/**
 * Displays a list of project cards sorted by publication date (newest first).
 *
 * This component fetches project posts from the file system and renders them as ProjectCard components.
 * Projects can be filtered by index range or by specific titles, but not both simultaneously.
 *
 * The first two projects are marked with priority for optimized image loading.
 *
 * @param range - Optional 1-based index range (e.g., [1, 5] shows projects 1-5, [1] shows from 1 to end)
 * @param byTitle - Optional array of project titles to display in the order specified
 * @throws Error if both range and byTitle are provided, or if a specified title is not found
 */
export function Projects({ range, byTitle }: ProjectsProps) {
  let allProjects = getPosts(["src", "app", "work", "projects"]);

  // Check if both range and byTitle are provided. If so, error.
  // Otherwise fetch the appropriate project(s).
  if (range && byTitle) {
    throw new Error(
      "Projects cannot filter both range and byTitle at the same time. Please choose one to filter by." +
        `Range is '${range}' and byTitle is '${byTitle}'`
    );
  }

  // TODO: Consider making the sorting options more dynamic.
  const sortedProjects = allProjects.sort((a, b) => {
    return (
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
    );
  });

  let displayedProjects: {
    metadata: MdxMetadata;
    slug: string;
    content: string;
  }[];

  // Add functionality to find by title then fall back to using range or using
  // all projects if no filters are provided.
  if (byTitle) {
    if (byTitle.length === 0) {
      throw new Error(
        "No project titles provided. Please provide at least one title."
      );
    }

    displayedProjects = [];
    byTitle.forEach((title) => {
      const foundProject = allProjects.find(
        (project) => project.metadata.title === title
      );
      if (!foundProject) {
        throw new Error(
          `Project with title '${byTitle}' not found. Please check the title and try again.`
        );
      }
      displayedProjects.push(foundProject);
    });
  } else if (range) {
    displayedProjects = sortedProjects.slice(
      range[0] - 1,
      range[1] ?? sortedProjects.length
    );
  } else {
    displayedProjects = sortedProjects;
  }

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayedProjects.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          key={post.slug}
          href={`work/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          content={post.content}
          avatars={
            post.metadata.team?.map((member) => ({ src: member.avatar })) || []
          }
          link={post.metadata.link || ""}
        />
      ))}
    </Column>
  );
}
