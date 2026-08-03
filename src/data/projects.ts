export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  tech: string[];
  url: string;
  github?: string;
  appStore?: string;
  features: string[];
}

export const projects: Project[] = [
  {
    slug: 'rankedchoices',
    name: 'Ranked Choices',
    tagline: 'Free ranked choice voting calculator',
    description:
      'A free, open-source ranked choice voting app with over 59,000 ballots created and 317,000 votes cast. Anyone can create a ballot, collect ranked votes, and see results calculated with proper RCV algorithms. Supports multi-seat elections, multiple tie-breaking methods, and flexible voter registration.',
    tech: ['AngularJS', 'PHP', 'MySQL', 'Bootstrap', 'Vite'],
    url: 'https://rankedchoices.com',
    github: 'https://github.com/DavidMoritz/rcv',
    features: [
      'Create ballots with shareable links and QR codes',
      'Drag-and-drop ranked voting interface',
      'Multi-seat election support with vote transfers',
      'Visual results via RCVis integration',
      'Voter registration modes: anonymous, optional, required, or code-based'
    ]
  },
  {
    slug: 'bingobolt',
    name: 'BingoBolt',
    tagline: 'Custom bingo board creator and real-time game host',
    description:
      'A full-stack web app for creating custom bingo boards and hosting live games. Players join via a shareable code, mark squares in real-time, and compete for bingo. Built with React, TypeScript, and AWS Amplify with AppSync GraphQL subscriptions for real-time updates.',
    tech: ['React', 'TypeScript', 'AWS Amplify', 'GraphQL', 'Tailwind CSS', 'Vite'],
    url: 'https://bingobolt.com',
    github: 'https://github.com/DavidMoritz/bingo',
    features: [
      'Create custom bingo boards with your own phrases',
      'Share a game code for players to join instantly',
      'Real-time game state via GraphQL subscriptions',
      'Player profiles with game history',
      'Responsive design for mobile and desktop'
    ]
  },
  {
    slug: 'thecrowdcoder',
    name: 'The Crowd Coder',
    tagline: 'Crowdfunding meets developer marketplace',
    description:
      'A platform connecting people who have ideas for software with developers who can build them. Users pitch project ideas, the community votes and funds the best ones, and qualified developers bid to build them. Combines crowdfunding mechanics with a freelance dev marketplace.',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'TanStack Router', 'Vite'],
    url: 'https://thecrowdcoder.com',
    github: 'https://github.com/DavidMoritz/thecrowdcoder',
    features: [
      'Project pitch and voting system',
      'Developer profiles and portfolios',
      'Crowdfunding campaign management',
      'Bid and proposal workflow',
      'Community discussion threads'
    ]
  },
  {
    slug: 'prehistorybook',
    name: 'Prehistory Book',
    tagline: 'An illustrated journey through prehistoric life',
    description:
      "An interactive web experience exploring Earth's prehistoric past through illustrated timelines and detailed articles. Covers major geological eras, key species, and evolutionary milestones in an accessible, visually rich format.",
    tech: ['React Native', 'TypeScript', 'Tailwind CSS', 'Vite'],
    url: 'https://www.prehistorybook.com',
    appStore: 'https://apps.apple.com/us/app/prehistory-book/id6755539898',
    features: [
      'Interactive geological timeline',
      'Illustrated species profiles',
      'Era-by-era exploration',
      'Mobile-friendly reading experience'
    ]
  },
  {
    slug: 'rivalryclub',
    name: 'Rivalry Club',
    tagline: 'Head-to-head competition platform',
    description:
      "A platform for organizing and tracking head-to-head competitions and rivalries. Whether it's sports picks, trivia, or custom challenges, Rivalry Club lets friends compete, track scores, and settle debates once and for all.",
    tech: ['React Native', 'TypeScript', 'Tailwind CSS', 'Vite'],
    url: 'http://rivalry.club',
    appStore: 'https://apps.apple.com/us/app/rivalry-club/id6740737367',
    features: [
      'Create and manage rivalries',
      'Track head-to-head records',
      'Custom challenge categories',
      'Leaderboards and statistics'
    ]
  }
];
