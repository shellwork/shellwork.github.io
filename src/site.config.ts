// Site-wide profile. Edit this file to change your name, bio and links.
// Longer content (publications, projects, posts, experience, news) lives in src/content/.

export const site = {
  // Full name as it appears in the header and <title>.
  name: 'Baiding Chen',
  // Optional name in another script, shown next to your name on the home page.
  altName: '',
  // One-line position shown under your name.
  title: 'M.S. Student in Automated Science',
  affiliation: 'Carnegie Mellon University',
  affiliationUrl: 'https://www.cmu.edu',
  location: 'Pittsburgh, PA',
  description:
    'Baiding Chen, M.S. student at Carnegie Mellon University: LLM agents for laboratory automation and AI for biology.',

  // Short bio on the home page. Markdown-style links are not parsed here; keep it plain text.
  bio: [
    'I am an M.S. student in Automated Science at the School of Computer Science, Carnegie Mellon University, working with Prof. Min Xu and Prof. Rebecca E. Taylor.',
    'My research sits between AI and the life sciences: I build LLM agent systems that turn scientific intent into executable laboratory automation, and develop deep learning methods for biological data such as cryo-electron tomography and sequencing.',
    "Before CMU, I received my B.Sc. in Biomedical Statistics from Xi'an Jiaotong-Liverpool University (XJTLU), where I led the iGEM software team to a Gold Medal.",
  ],

  // Shown as tags on the home page.
  interests: ['LLM Agents', 'Laboratory Automation', 'AI for Science', 'Computational Biology'],

  // Put your photo in public/ and set the path here, or set to '' to show initials.
  avatar: '/avatar.jpg',

  // Spellings of your name in author lists; matches are highlighted on publications.
  authorNames: ['Baiding Chen', 'B. Chen'],

  email: 'baidingc@andrew.cmu.edu',
  // Path to your CV PDF inside public/, or '' to hide the download link.
  cvPdf: '',

  links: {
    github: 'https://github.com/shellwork',
    scholar: '',
    orcid: '',
    linkedin: 'https://www.linkedin.com/in/baiding-chen-4383b2381',
    twitter: '',
  },

  // How many items the home page shows in each section.
  home: {
    news: 5,
    posts: 3,
  },

  // Look and feel. Fonts and the rest of the palette live in src/styles/global.css.
  theme: {
    // Main color for links, badges and highlights. Lighter tints are derived from it.
    // 'auto' picks it from the banner image at build time, adjusted so text stays readable;
    // or set it by hand: { light: '#1f5f8b', dark: '#7db7e0' }.
    // Currently a muted steel blue taken from the banner's blue (feeder / whiteboard ink).
    accent: { light: '#4d7299', dark: '#80a2c8' } as 'auto' | { light: string; dark: string },
    // Used when accent is 'auto' but there is no banner image, or the image is mostly grey.
    accentFallback: { light: '#1f5f8b', dark: '#7db7e0' },
    banner: {
      // File name of an image in src/assets/ (e.g. 'banner.jpg'), or '' for an animated gradient.
      // An .svg is inlined, so its own CSS animations play (see lab-banner.svg).
      image: 'lab-banner.svg',
      alt: 'Illustration of a robotics and biology lab: a robot arm moves sample racks next to a microscope, centrifuge and test tubes',
      // Height on desktop in px; phones use about 60% of it.
      height: 300,
      // Which part of the image stays visible when cropped (CSS object-position).
      position: 'center 40%',
    },
    // Scroll-in animations and page transitions. Visitors who ask their OS for
    // reduced motion never see them, whatever this is set to.
    motion: true,
  },
} as const;

export type SiteConfig = typeof site;
