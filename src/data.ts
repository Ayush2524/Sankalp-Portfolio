export type MediaItem = {
  type: 'video' | 'carousel' | 'image'
  aspect: '9:16' | '4:5' | '1:1' | '16:9'
  src?: string
  slides?: string[]
  poster?: string
  title: string
  caption: string
  link?: string
}

export const site = {
  email: 'mailto:hello@sankalpbhitkar.com',
  hero: {
    video: { src: '/media/hero/sankalp.mp4', poster: '/media/hero/sankalp-poster.jpg', aspect: '16:9' as const, previewSeconds: 6 },
  },
  aboutPortrait: '/media/sankalp-about.jpg',
  nav: ['impact', 'work', 'about'],
  impactHeading: {
    lead: 'Impact, not just',
    emphasis: 'decoration',
    qualifier: '(with ₹0 budget)',
  },
  stats: [
    { final: '20 Cr', target: 20, suffix: ' Cr', label: 'Built startup (1 Cr angel round)' },
    { final: '55K+', target: 55, suffix: 'K+', label: 'LinkedIn impression' },
    { final: '101K+', target: 101, suffix: 'K+', label: 'Instagram impressions' },
    { final: '50+', target: 50, suffix: '+', label: 'Carousels and brand assets' },
    { final: '2K+', target: 2, suffix: 'K+', label: 'Active users (premium)' },
    { final: '766%', target: 766, suffix: '%', label: 'LinkedIn follower growth' },
    { final: "IITB'27", target: undefined, suffix: '', label: "Student at India's best college" },
    { final: '2', target: 2, suffix: '', label: 'Years of experience' },
  ],
  supporters: [
    {
      name: 'Ganeshprasad Sridharan',
      role: 'Co Founder @ThinkSchool',
      image: '/media/ganeshprasad-sridharan.png',
      url: 'https://www.instagram.com/reel/DYO9C4mMH8C/?vrfl=MWZzZ3RsZTkyY3Bpbw==',
      ariaLabel: "View Ganeshprasad's content on Instagram (opens in a new tab)",
    },
    {
      name: 'Chandan Mendiratta',
      role: 'CBO @Zepto',
      image: '/media/chandan-mendiratta.png',
      url: 'https://lnkd.in/p/di_xta_V',
      ariaLabel: "View Chandan's content on LinkedIn (opens in a new tab)",
    },
  ],
  social: {
    instagram: {
      label: 'Instagram',
      url: 'https://www.instagram.com/sankalp_9125?srtk=dHM4bmQ5eGV2dTlh',
      ariaLabel: 'Sankalp on Instagram (opens in a new tab)',
    },
    linkedin: {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/sankalp-bhitkar',
      ariaLabel: 'Sankalp on LinkedIn (opens in a new tab)',
    },
  },
  chapters: [
    {
      cover: '/covers/novare-cover.png',
      coverMobile: '',
      title: 'Chapter 2: Novare Talent',
      href: '/novare-talent',
    },
    {
      cover: '/covers/freelance-cover.png',
      coverMobile: '',
      title: 'Chapter 1: Freelancing',
      href: '/freelance',
    },
    {
      cover: '/covers/personal-cover.png',
      coverMobile: '',
      title: 'Never ending chapter : personal brand',
      href: '/personal-brand',
    },
  ],
  about: [
    "I've never been particularly interested in taking the path that makes the most sense on paper.",
    "I'm a BTech student at IIT Bombay, and despite being from India's best technical institute, I chose to pursue a career in the creative industry. And that meant it would involve a lot of sacrifices.",
    'Most people would call that a risk. I think the bigger risk is spending your life becoming someone you never wanted to be.',
    "I'm fascinated by psychology: why people think, what makes them care, and what drives them to act. It's been my secret weapon in design, branding, storytelling, and building things from scratch.",
    'The more I understand people, the better I get at creating things that matter to them.',
    'I want to build things, challenge assumptions, and explore just how far I can take an idea.',
    "Not because I'm certain I'll succeed, but because I'm unwilling to let certainty decide the limits of my ambition.",
  ],
}

const demo = (type: MediaItem['type'], aspect: MediaItem['aspect'], title: string): MediaItem => ({
  type,
  aspect,
  slides: type === 'carousel' ? ['', '', '', '', '', '', '', ''] : undefined,
  title,
  caption: 'Placeholder media — replace from src/data.ts.',
  link: '#',
})

export const contentSystem = [
  {
    title: 'Attention driven content',
    metric: 'Profile viewers increased by 150%',
    items: [
      {
        ...demo('image', '1:1', 'Founder-led story'),
        src: '/media/attention/swiggy-story.png',
        caption: 'Stories are a great way to attract a large amount of attention from the right audience.',
      },
      {
        ...demo('image', '1:1', 'Attention carousel'),
        src: '/media/attention/intern-hiring.png',
        caption: 'Hiring posts always have a high rate of commenting as well as sharing.',
      },
    ],
  },
  {
    title: 'Proof driven content',
    metric: 'CTR increased by 44%',
    items: [
      {
        ...demo('image', '1:1', 'Proof carousel'),
        src: '/media/proof/nikhil-proof.png',
        caption: 'Testimonials from students increased our brand trust and increased users on ZENHYRE.',
      },
      {
        ...demo('image', '4:5', 'Social proof'),
        src: '/media/proof/deep-proof.png',
        caption: "Such content also helped us in shaping the brand's positioning as the first student-friendly HR Tech brand.",
      },
    ],
  },
  {
    title: 'value driven content',
    metric: 'Followers increased by 300%',
    items: [
      {
        ...demo('carousel', '4:5', 'Information latency'),
        slides: [
          '/media/value-content/slide-01.jpg',
          '/media/value-content/slide-02.jpg',
          '/media/value-content/slide-03.jpg',
          '/media/value-content/slide-04.jpg',
          '/media/value-content/slide-05.jpg',
          '/media/value-content/slide-06.jpg',
          '/media/value-content/slide-07.jpg',
          '/media/value-content/slide-08.jpg',
        ],
        caption: 'This post talks about information latency among students regarding opportunities, which is something no brand talks about, let alone in detail.',
      },
      {
        ...demo('carousel', '4:5', 'The Zenhyre workflow'),
        slides: [
          '/media/value-content-2/slide-01.jpg',
          '/media/value-content-2/slide-02.jpg',
          '/media/value-content-2/slide-03.jpg',
          '/media/value-content-2/slide-04.jpg',
          '/media/value-content-2/slide-05.jpg',
          '/media/value-content-2/slide-06.jpg',
          '/media/value-content-2/slide-07.jpg',
          '/media/value-content-2/slide-08.jpg',
        ],
        caption: 'This post acts as BoFu (bottom of the funnel) content to attract IITians and fulfil their needs of getting them connected with high-value opportunities on Zenhyre.',
      },
    ],
  },
  {
    title: 'Connection driven content',
    metric: 'Engagement rate increased by 600%',
    items: [
      {
        ...demo('carousel', '4:5', 'Beyond the CGPA'),
        slides: [
          '/media/connection-content/slide-01.jpg',
          '/media/connection-content/slide-02.jpg',
          '/media/connection-content/slide-03.jpg',
          '/media/connection-content/slide-04.jpg',
          '/media/connection-content/slide-05.jpg',
          '/media/connection-content/slide-06.jpg',
          '/media/connection-content/slide-07.jpg',
        ],
        caption: 'One of the major messaging tactics was to challenge the traditional hiring system, which considers grades as an important metric. So we decided to challenge this reality.',
      },
      {
        ...demo('carousel', '4:5', 'The rejection gap'),
        slides: [
          '/media/connection-content-2/slide-01.jpg',
          '/media/connection-content-2/slide-02.jpg',
          '/media/connection-content-2/slide-03.jpg',
          '/media/connection-content-2/slide-04.jpg',
          '/media/connection-content-2/slide-05.jpg',
          '/media/connection-content-2/slide-06.jpg',
        ],
        caption: 'Hiring has always been unfair to students, and this post exactly addresses that pain point. Hence, making it easier for us to build connection and community.',
      },
    ],
  },
]

export const pages = {
  novare: {
    label: 'Chapter 2:',
    date: 'June 2025 - Present',
    title: 'FOUNDING MEMBER @NOVARE TALENT',
    heroMedia: [
      { src: '/media/novare-milestones/milestone-01.png', alt: '1,500 plus active community members across the top seven IITs' },
      { src: '/media/novare-milestones/milestone-02.png', alt: 'Novare Talent current valuation of 20 crore rupees' },
      { src: '/media/novare-milestones/milestone-03.png', alt: 'Novare Talent incubated at IIT Bombay SINE in January 2026' },
      { src: '/media/novare-milestones/milestone-04.png', alt: 'Novare Talent served Flosync founder Aniket Deb' },
    ],
    arenaBanner: '/media/arenax-banner.png',
    arenaxUrl: 'https://arena.novaretalent.com',
    productSlides: [
      '/media/product-snapshot/slide-01.png',
      '/media/product-snapshot/slide-02.png',
      '/media/product-snapshot/slide-03.png',
      '/media/product-snapshot/slide-04.png',
    ],
    storyboardSlides: [
      '/media/storyboard/slide-01.png',
      '/media/storyboard/slide-02.png',
      '/media/storyboard/slide-03.png',
      '/media/storyboard/slide-04.png',
      '/media/storyboard/slide-05.png',
    ],
    intro: [
      'Freelancing taught me to solve problems for businesses. But I was always operating from the outside. I wanted a seat at the table where the business itself was being built.',
      "I didn't just want to work on businesses. I wanted to build one.",
      'So, I quit freelancing and stepped into the startup world.',
      "On 25th July'25, I co-founded Novare Talent with four teammates.",
      'Today, the company is valued at ₹20 crore.',
      'Novare Talent is building a capability-based hiring ecosystem which makes hiring fair for students and faster for recruiters.',
      'The experience turned me from a specialist into a generalist — taking me beyond design into product, strategy, distribution, and business.',
    ],
    arena: [
      'We started Novare Talent by serving students across the top 7 IITs.',
      'Our first product, Zenhyre, was a hiring marketplace built around a simple idea: connect exceptional IIT talent with the right opportunities.',
      'But expanding to Tier 2 and Tier 3 colleges presented a different challenge.',
      'How do you reach a much wider talent pool without diluting a premium brand positioning?',
      'Our answer was to change the experience entirely.',
      "Instead of building another job portal, we imagined a gaming-inspired platform where students could sharpen their coding and AI skills, compete, and prove what they could do. Top performers on ArenaX would be selected to be on Novare's talent pool and thus will be getting hired at high potential opportunities.",
      "That's how ArenaX, a competitive coding and AI upskilling platform, was born.",
      'We chose the Japanese samurai theme for ArenaX because a samurai is an epitome of discipline and skills built through insane, rigorous practice, much like the traits of great coders and programmers.',
    ],
    ux: [
      'But the product had a UX problem of its own.',
      "The Japanese samurai theme gave ArenaX a distinctive identity, but the experience wasn't intuitive enough. Users needed to understand the product before they could immerse themselves in it.",
      'So, I introduced a storyboard to bridge the gap between the product’s narrative and its functionality. It gave users a sense of progression, contextualised the experience, and made onboarding feel less like navigating a platform and more like entering a battle arena.',
      "The idea wasn't just to make the interface look like a game. It was to make the user feel like they were entering one.",
    ],
  },
  freelance: {
    label: 'Chapter 1:',
    date: 'August 2024 - May 2025',
    title: 'FREELANCE BRAND DESIGNER',
    pdfViewer: {
      openLabel: 'Open in new tab ↗',
      closeAriaLabel: 'Close PDF viewer',
      fallbackMessage: "Can't preview this file here.",
      fallbackAction: 'Open PDF in a new tab ↗',
    },
    intro: [
      'Back in my first year at IIT Bombay (2023), I found myself drawn to design.',
      'My verbal communication skills were nerfed, so the idea of communicating without having to say a word fascinated me. Somewhere along the way, I stumbled upon brand identity design, and things started to click.',
      'Like any college student who wanted to stop asking for money and start making his own, I turned to freelancing. It gave me a way to explore design, work with clients, and make some cash on the side.',
      'But somewhere between the projects and the payments, I realised something.',
    ],
    statement: "I was learning to play the game. I just hadn't realised how small I'd made the game itself.",
    projects: [
      {
        name: 'Fastlane',
        image: '/media/freelance-projects/fastlane.png',
        pdfView: 'https://drive.google.com/file/d/1wMETkNl2cek597lWhkIEfB1QEzAG0iWz/view?usp=drive_link',
        pdfPreview: 'https://drive.google.com/file/d/1wMETkNl2cek597lWhkIEfB1QEzAG0iWz/preview',
      },
      {
        name: 'Blues',
        image: '/media/freelance-projects/blues.png',
        pdfView: 'https://drive.google.com/file/d/1wI0kIWeJRDXYKGVmg7c35TWIkUNPiwcY/view?usp=drive_link',
        pdfPreview: 'https://drive.google.com/file/d/1wI0kIWeJRDXYKGVmg7c35TWIkUNPiwcY/preview',
      },
      {
        name: 'Nest',
        image: '/media/freelance-projects/nest.png',
        pdfView: 'https://drive.google.com/file/d/1F9xP18wdJztyU-VLv0kPTs5FKZm7R4BP/view?usp=drive_link',
        pdfPreview: 'https://drive.google.com/file/d/1F9xP18wdJztyU-VLv0kPTs5FKZm7R4BP/preview',
      },
      {
        name: 'Hammer',
        image: '/media/freelance-projects/hammer.png',
        pdfView: 'https://drive.google.com/file/d/1dF8_mR6PRyXWLrNX07aLUDqBb_jby7Z3/view?usp=drive_link',
        pdfPreview: 'https://drive.google.com/file/d/1dF8_mR6PRyXWLrNX07aLUDqBb_jby7Z3/preview',
      },
    ],
  },
  personal: {
    label: 'Unended chapter:',
    date: 'February 2026 - Present',
    title: 'BUILDING PERSONAL CONTENT ENGINE',
    heading: "What's the value of art if there's no audience?",
    // Use "9:16" or "16:9" per video. "id" is the part after "youtu.be/" or "/shorts/".
    videos: [
      { id: 'tjO3eItGx-U', title: 'Reel 01', aspect: '9:16' },
      { id: 'CAqU_aWy-p4', title: 'Reel 02', aspect: '9:16' },
      { id: 'l9XA0I2u6_Q', title: 'Reel 03', aspect: '9:16' },
      { id: 'oGRgFbiA3u0', title: 'Reel 04', aspect: '9:16' },
      { id: 'gfvkxsL-S9w', title: 'Reel 05', aspect: '9:16' },
      { id: 'AJmSx3fjOqQ', title: 'Reel 06', aspect: '9:16' },
      { id: 'RYPiqiXPbfQ', title: 'Reel 07', aspect: '9:16' },
      { id: '9a4rfzxWo9E', title: 'Reel 08', aspect: '9:16' },
    ] as { id: string; title: string; aspect: '9:16' | '16:9' }[],
    copy: [
      "That question stuck with me while building Novare Talent. I wasn't just building, I was building myself too.",
      'And for my personal brand, I wanted to document the person I was becoming.',
      'And, more importantly, overcome my biggest challenges: Communication and Confidence.',
      "This isn't just a story about what I'm building. It's a record of who I'm becoming.",
    ],
  },
}
