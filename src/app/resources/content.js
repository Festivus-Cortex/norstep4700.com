import { InlineCode } from "@/once-ui/components";

const person = {
  firstName: "Preston",
  lastName: "Johnson",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "Game Developer",
  avatar: "/images/avatar.webp",
  location: "America/New_York", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: [], // optional: Leave the array empty if you don't want to display languages
};

const newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>Nope.avi - Replace this if newsletter is enabled.</>,
};

const social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/norstep4700/",
  },
  {
    name: "Email",
    icon: "email",
    link: "mailto:norstep4700@gmail.com",
  },
];

const home = {
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Game Developer and Audio Explorer</>,
  subline: (
    <>
      I'm Preston, a game developer at <InlineCode>MahiGaming</InlineCode>,
      where I... FIXME: ADD DESCRIPTION
    </>
  ),
};

const about = {
  label: "About",
  title: "About me",
  description: `Hello from ${person.name}, ${person.role} at ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        Preston is a game developer at MahiGaming, where he... // FIXME: Add
        detail
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    // FIXME: ADD MORE XP!
    experiences: [
      {
        company: "MahiGaming",
        timeframe: "2022 - Present",
        role: "Game Developer Group Lead",
        achievements: [
          <>
            FIXME: Tweak or remove this Optimized audio pipeline to save 8% RAM
            usage on audio buffers at runtime.
          </>,
          <>FIXME: SAMPLE 2</>,
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          // FIXME: Consider adding images to the project folder or remove this comment.
        ],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Education",
    institutions: [
      {
        name: "Rochester Institute of Technology",
        description: <>FIXME: Add RIT detail</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "FIXME",
        description: (
          <>Able to prototype in Figma with Once UI with unnatural speed.</>
        ),
        // optional: leave the array empty if you don't want to display images
        images: [],
      },
      {
        title: "Next.js",
        description: (
          <>Building next gen apps with Next.js + Once UI + Supabase.</>
        ),
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/project-01/cover-04.jpg",
            alt: "Project image",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
};

// Blog Disabled  currently.
const blog = {
  label: "Blog",
  title: "Disabled blog with sample :p Maybe some audio and dev stuff later",
  description: `What ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  label: "Work",
  title: "My projects",
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery = {
  label: "Gallery",
  title: "My photo gallery",
  description: `A photo collection by ${person.name}`,
  // Images from https://pexels.com
  images: [
    // FIXME: Add/Replace images
    {
      src: "/images/gallery/img-01.jpg",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

const resume = {
  title: "Resume",
  label: "Resume",
  description: "Resume for Preston Johnson",
};

const license = {
  label: "License",
  title: "License",
  description:
    "Shows applicable licenses for external content used in this portfolio site.",
};

export {
  person,
  social,
  newsletter,
  home,
  about,
  blog,
  work,
  gallery,
  resume,
  license,
};
