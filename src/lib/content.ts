import type { LucideIcon } from 'lucide-react'
import {
  AppWindow,
  BookOpen,
  ChartNoAxesCombined,
  Compass,
  Hammer,
  Mail,
  MessageCircle,
  ShieldCheck,
  Wand2,
} from 'lucide-react'

export interface AppFeature {
  title: string
  body: string
}

export interface AppRecord {
  /** Slug used in the URL: pdx.software/<slug> */
  slug: string
  name: string
  tagline: string
  description: string
  ctaLabel: string
  ctaHref: string
  status: string
  /** Top-of-grid featured cards get the bigger tile + logo treatment. */
  featured: boolean
  Icon: LucideIcon
  /** Brand colour used on the logo chip + accents. */
  accent: string
  features: AppFeature[]
  /** Lines shown in the home-page hero carousel. */
  carouselLines: string[]
}

export const apps: AppRecord[] = [
  {
    slug: 'app-sweep',
    name: 'App Sweep',
    tagline: 'Force quit and trash Mac apps in one clean step.',
    description:
      'A compact macOS utility for force quitting selected apps, moving them to Trash, and emptying Trash from one focused window.',
    ctaLabel: 'See App Sweep',
    ctaHref: '/app-sweep',
    status: 'Mac utility',
    featured: true,
    Icon: AppWindow,
    accent: '#1769e0',
    features: [
      {
        title: 'Review before removal',
        body: 'Selected app paths stay visible before the user confirms any action. Apps move to Trash rather than being permanently deleted.',
      },
      {
        title: 'Permission-aware by design',
        body: 'macOS may ask for Finder automation, Full Disk Access, or admin approval. App Sweep explains the prompts and never bypasses system security.',
      },
      {
        title: 'Quiet, local, opinionated',
        body: 'No analytics, no accounts, no telemetry. Theme, menu-bar visibility, and review-prompt state stay in local macOS preferences.',
      },
    ],
    carouselLines: [
      'Force quit. Move to Trash. Empty Trash. One window.',
      'App Sweep keeps the selected paths visible until you confirm.',
      'No analytics. No accounts. macOS keeps the security prompts.',
    ],
  },
  {
    slug: 'fly-mail',
    name: 'Fly Mail',
    tagline: 'AI-first email at mail.fly.pm.',
    description:
      'A modern inbox built on Cloudflare. Auto-labelling, forwarding + labelling rules, fly.pm tracking with bot filtering, and a draggable activity inspector that shows opens, clicks, and where they came from.',
    ctaLabel: 'Open Fly Mail',
    ctaHref: 'https://mail.fly.pm',
    status: 'Web mail client',
    featured: true,
    Icon: Mail,
    accent: '#a3be8c',
    features: [
      {
        title: 'AI labelling that actually fires',
        body: 'A self-learning labeller tags inbound mail with newsletter / social / notification / receipt / school categories so the sidebar fills out on its own.',
      },
      {
        title: 'Forwarding + labelling rules',
        body: 'Match on sender, recipient, subject, or body. Optionally mark as read, archive, or apply a label automatically. Create rules in one click from any thread.',
      },
      {
        title: 'Privacy-first tracking',
        body: 'Outbound tracking is scanner-aware: machine pre-fetches are filtered out of opens. Inbound, third-party pixels are stripped and clicks route through a no-referrer proxy.',
      },
      {
        title: 'Local-first sync',
        body: 'IndexedDB caches the full thread history per device; the inbox virtualises with TanStack so a 10k-thread cache scrolls without lag.',
      },
    ],
    carouselLines: [
      'AI-first email at mail.fly.pm.',
      'Forwarding + labelling rules. One click from any thread.',
      'Open + click tracking, with machine pre-fetches filtered out.',
      'Local IndexedDB cache. The inbox renders before the network does.',
    ],
  },
  {
    slug: 'fly',
    name: 'Fly',
    tagline: 'Link tracking and click analytics at fly.pm.',
    description:
      'Short links, redirects, and lightweight campaign measurement. Powered by Cloudflare Workers + Analytics Engine.',
    ctaLabel: 'Visit fly.pm',
    ctaHref: 'https://fly.pm',
    status: 'Link tracking',
    featured: false,
    Icon: ChartNoAxesCombined,
    accent: '#5e81ac',
    features: [
      {
        title: 'Real-time clicks',
        body: 'Every redirect lands in Cloudflare Analytics Engine within seconds, queryable by slug, geo, browser, and OS.',
      },
      {
        title: 'Per-recipient codes',
        body: 'Each Fly Mail recipient gets its own short link so opens and clicks attribute back to the specific address.',
      },
    ],
    carouselLines: [
      'Short links with click analytics at fly.pm.',
      'Backed by Cloudflare Workers + Analytics Engine.',
    ],
  },
  {
    slug: 'book-cook',
    name: 'Book Cook',
    tagline: 'Outline, draft, and ship a book with AI scene-by-scene.',
    description:
      'A studio for long-form authoring. Build a chapter outline, draft scene-by-scene against beat-purpose prompts, and iterate on tone via a reusable voice profile.',
    ctaLabel: 'Open Book Cook',
    ctaHref: 'https://book-cook.com',
    status: 'AI authoring studio',
    featured: false,
    Icon: BookOpen,
    accent: '#d08770',
    features: [],
    carouselLines: [
      'Outline first, draft scene-by-scene, iterate on tone last.',
    ],
  },
  {
    slug: 'makethe-app',
    name: 'Make The App',
    tagline: 'Prompt-to-app builder for the rest of us.',
    description:
      'Describe what you want, get a deployed app. A prompt-driven scaffolder that wires up the front-end, back-end, and a Cloudflare-native runtime in one round-trip.',
    ctaLabel: 'Visit makethe.app',
    ctaHref: 'https://makethe.app',
    status: 'Prompt-to-app builder',
    featured: false,
    Icon: Wand2,
    accent: '#88c0d0',
    features: [],
    carouselLines: [
      'Prompt an idea, ship the app.',
    ],
  },
  {
    slug: 'alex',
    name: 'alex',
    tagline: 'A native conversational companion for Apple platforms.',
    description:
      'A Mac, iPhone, and Watch app for keeping a long-running conversation with an assistant, with widgets, share-sheet capture, and a watch face glance.',
    ctaLabel: 'Visit alex.chat',
    ctaHref: 'https://alex.chat',
    status: 'Mac · iOS · watchOS',
    featured: false,
    Icon: MessageCircle,
    accent: '#b48ead',
    features: [],
    carouselLines: [
      'A native, always-on companion across Mac, iPhone, and Watch.',
    ],
  },
]

export function getAppBySlug(slug: string): AppRecord | undefined {
  return apps.find(a => a.slug === slug)
}

/** Flat list of carousel lines shown on the home hero. Featured apps lead. */
export function homeCarouselLines(): Array<{ app: AppRecord, line: string }> {
  const out: Array<{ app: AppRecord, line: string }> = []
  for (const a of apps.filter(a => a.featured)) {
    for (const line of a.carouselLines) out.push({ app: a, line })
  }
  for (const a of apps.filter(a => !a.featured)) {
    for (const line of a.carouselLines) out.push({ app: a, line })
  }
  return out
}

// Legacy export kept for older imports.
export const companies = apps.map(a => ({
  name: a.name,
  description: a.description,
  href: a.ctaHref,
  status: a.status,
  Icon: a.Icon,
}))

export const principles = [
  {
    title: 'Focused products',
    body: 'Each product starts with a narrow job and earns complexity only when it makes that job clearer.',
    Icon: Compass,
  },
  {
    title: 'Local-first where it matters',
    body: 'Desktop utilities respect the device boundary; cloud products are explicit about what they store.',
    Icon: ShieldCheck,
  },
  {
    title: 'Useful over loud',
    body: 'The company site stays quiet because the products are meant to be judged by whether they solve real work.',
    Icon: Hammer,
  },
]

export const legalEmail = 'help@pdx.software'
