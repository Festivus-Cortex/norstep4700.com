import { InlineCode } from "@/once-ui/components";

const person = {
  firstName: "Preston",
  lastName: "Johnson",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "Game Developer",
  avatar: "/images/avatar.webp",
  timeZone: "America/New_York", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  location: "USA, Florida",
  languages: [], // optional: Leave the array empty if you don't want to display languages
};

const newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}&apos;s Newsletter</>,
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
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/Norstep",
  },
];

const home = {
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Game Developer and Audio Explorer</>,
  subline: (
    <>
      Hello World! I am {person.firstName}, a game developer at{" "}
      <InlineCode>MahiGaming</InlineCode>, where I lead product teams to rapidly
      deliver premium online slot machine games to the global market on a real
      money casino platform.
    </>
  ),
};

const about = {
  label: "About",
  title: "About Me",
  description: `All about ${person.name}, ${person.role} at ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: true,
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
        Innovative, passionate, and versatile developer with over 10 years of
        experience in game development across various platforms, focusing on
        iGaming content. Proficient in leading development teams, bringing
        compelling game mechanics to life, and implementing full-stack web and
        mobile solutions to support products. Adept in audio production and
        integration that enhances user experiences in gaming. Adaptive to
        diverse software development contexts by leveraging broad technical
        skills and strong problem-solving abilities.
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

// Blog Disabled currently.
const blog = {
  label: "Blog",
  title: "Disabled blog with sample :p Maybe some audio and dev stuff later",
  description: `What ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  label: "Work",
  title: "Games and Projects - Preston Johnson",
  description: `Game Development, Audio, and Miscellaneous projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery = {
  label: "Gallery",
  title: "Pictures of Preston Johnson",
  description: `Pictures of ${person.name} and his adventures`,
  images: [
    {
      src: "/images/gallery/preston-suit.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/avatar.webp",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/preston-rit-mahis.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/preston-joey-rit-2020.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/preston-mahi-gdc.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/preston-emily-roth-wedding.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/preston-ren-fair.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/preston-durban-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/preston-durban-2.jpg",
      alt: "image",
      orientation: "vertical",
    },

    {
      src: "/images/gallery/mr-kitty-lizard.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/preston-emily-festival-2021.jpg",
      alt: "image",
      orientation: "horizontal",
    },
  ],
};

const resume = {
  title: "Resume",
  label: "Resume",
  description: "Resume for Preston Johnson",
  pdfSource: "docs/Preston-Johnson-Resume.pdf",
};

const license = {
  label: "License",
  title: "License",
  description:
    "Shows applicable attribution for external content used in this portfolio site.",
};

// FIXME: Finish using audio in the project after main content is done.
const audio = {
  bufferSources: [
    {
      name: "A.V. Zone 1",
      sources: [
        "/audio/zone1/deactivator.mp3",
        "/audio/zone1/elasticity.mp3",
        "/audio/zone1/freezer.mp3",
        "/audio/zone1/initiator.mp3",
        "/audio/zone1/scrambler.mp3",
        "/audio/zone1/velocity.mp3",
      ],
      isDefault: true,
    },
  ],
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
