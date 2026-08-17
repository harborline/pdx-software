import type { LucideIcon } from 'lucide-react'
import { LISTED_PRODUCTS } from './products'
import { PRODUCT_SLUGS } from './routes'
import {
  AppWindow,
  AudioLines,
  BookOpen,
  BrainCircuit,
  Clapperboard,
  Code2,
  Compass,
  Hammer,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react'

export interface AppFeature {
  title: string
  body: string
}

export interface AppRecord {
  /**
   * Slug used in the URL: theharborline.co/<slug>. Typed against the Worker's
   * 404 table so adding a product without updating `routes.ts` fails the build.
   */
  slug: (typeof PRODUCT_SLUGS)[number]
  name: string
  tagline: string
  description: string
  ctaLabel: string
  ctaHref: string
  /** Optional home-card destination when the card should leave the site directly. */
  cardHref?: string
  status: string
  /** Top-of-grid featured cards get the bigger tile + logo treatment. */
  featured: boolean
  Icon: LucideIcon
  features: AppFeature[]
  /** Lines shown in the home-page hero carousel. */
  carouselLines: string[]
}

export const apps: AppRecord[] = [
  {
    slug: LISTED_PRODUCTS[0].slug,
    name: LISTED_PRODUCTS[0].name,
    tagline: 'Private, local AI notes.',
    description:
      'A private notes app for Mac, iPhone, and iPad with encrypted Markdown, connected ideas, and local AI.',
    ctaLabel: 'Explore Keepout',
    ctaHref: LISTED_PRODUCTS[0].url,
    cardHref: '/keepout',
    status: 'Mac · iPhone · iPad',
    featured: true,
    Icon: ShieldCheck,
    features: [
      {
        title: 'Private by design',
        body: 'AES-256-GCM encryption protects every note at rest. There is no account, cloud sync, analytics, remote prompt processing, or plaintext search index.',
      },
      {
        title: 'Connected knowledge',
        body: 'Link notes with wiki links, follow backlinks, search while the vault is unlocked, and explore an interactive knowledge graph.',
      },
      {
        title: 'Local AI',
        body: 'Ask questions, summarize notes, and suggest connections with Apple Foundation Models or an optional local MLX engine.',
      },
    ],
    carouselLines: [
      'Private notes with encrypted Markdown, connected ideas, and local AI.',
    ],
  },
  {
    slug: LISTED_PRODUCTS[1].slug,
    name: LISTED_PRODUCTS[1].name,
    tagline: 'Text to speech, local or cloud.',
    description:
      'A small macOS menu bar app for reading selected text aloud with free on-device voices and optional cloud providers.',
    ctaLabel: 'Explore Free Speech TTS',
    ctaHref: LISTED_PRODUCTS[1].url,
    cardHref: '/free-speech-tts',
    status: 'macOS menu bar app',
    featured: true,
    Icon: AudioLines,
    features: [
      {
        title: 'Speak from anywhere',
        body: 'Use a global hotkey, the menu bar action, or the macOS Services menu to read selected text aloud across the system.',
      },
      {
        title: 'Free local voices',
        body: 'Kokoro voices run entirely on the Mac, work without a network connection, and never send spoken text off the device.',
      },
      {
        title: 'Optional cloud voices',
        body: 'Connect ElevenLabs or Cartesia with your own API key when you want more voices. Both providers remain optional.',
      },
    ],
    carouselLines: [
      'Read selected text aloud with local or cloud voices.',
    ],
  },
]

/** Existing inbound product URLs remain available while omitted from the catalog. */
const unlistedApps: AppRecord[] = [
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
      '1-Click to Quit, Delete, & Empty the Trash Bin.',
    ],
  },
  {
    slug: 'prompt-producer',
    name: 'Prompt Producer',
    tagline: 'Turn rough ideas into polished prompts.',
    description:
      'An app for drafting, refining, and reusing prompts for everyday AI work.',
    ctaLabel: 'See Prompt Producer',
    ctaHref: '/prompt-producer',
    status: 'Prompt utility',
    featured: true,
    Icon: Sparkles,
    features: [
      {
        title: 'Prompt-ready drafts',
        body: 'Start from a rough request and shape it into clear instructions for coding, writing, research, or planning.',
      },
      {
        title: 'Reusable patterns',
        body: 'Keep useful prompt structures close at hand so repeated AI workflows start from a better baseline.',
      },
    ],
    carouselLines: [
      'Prompt Producer turns rough requests into reusable prompts.',
    ],
  },
  {
    slug: 'fly-mail',
    name: 'Fly',
    tagline: 'AI-first productivity manager and knowledge base.',
    description:
      'Fly securely connects email, notes, files, storage, tasks, links, and calendar context into one fast Cloudflare-native workspace with AI-searchable knowledge.',
    ctaLabel: 'Open Fly',
    ctaHref: 'https://fly.pm',
    status: 'AI productivity workspace',
    featured: true,
    Icon: BrainCircuit,
    features: [
      {
        title: 'Connected workspace',
        body: 'Bring mail, calendar, tasks, links, notes, and files into one account instead of splitting work across disconnected tools.',
      },
      {
        title: 'AI-searchable knowledge base',
        body: 'Use natural-language discovery across mail, notes, links, tasks, files, and stored documents from a single knowledge layer.',
      },
      {
        title: 'Secure Cloudflare-native storage',
        body: 'Workspace data is built around Cloudflare D1, R2, Vectorize, AutoRAG, and AI Gateway so connected information stays in a controlled infrastructure layer.',
      },
      {
        title: 'Actionable follow-ups',
        body: 'Triage conversations into links, tasks, follow-ups, daily overviews, launch notes, and calendar context without leaving the workspace.',
      },
    ],
    carouselLines: [
      'Fly connects email, notes, storage, and tasks into an AI-first workspace.',
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
    features: [],
    carouselLines: [
      'Outline first, draft scene-by-scene, iterate on tone last.',
    ],
  },
  {
    slug: 'spooool',
    name: 'Spooool',
    tagline: 'Cloudflare-native video publishing.',
    description:
      'A video platform for uploading, watching, embedding, and managing channels on Cloudflare infrastructure.',
    ctaLabel: 'Open Spooool',
    ctaHref: 'https://spooool.com',
    status: 'Video platform',
    featured: false,
    Icon: Clapperboard,
    features: [],
    carouselLines: [
      'Upload, watch, and share video on a Cloudflare-native platform.',
    ],
  },
  {
    slug: 'ai-dev-sidebar',
    name: 'AI Dev Sidebar',
    tagline: 'A browser side panel for developer context and local AI tools.',
    description:
      'A Chrome and Chromium extension that connects page inspection, recordings, bookmarks, history, cookies, synced resources, and local AI CLI workflows from the browser.',
    ctaLabel: 'View on GitHub',
    ctaHref: 'https://github.com/harborline/extension',
    status: 'Browser extension',
    featured: false,
    Icon: Code2,
    features: [],
    carouselLines: [
      'Browser context and local AI developer tools in one extension.',
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
    features: [],
    carouselLines: [
      'Make Any App with the Modern Stack',
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
    features: [],
    carouselLines: [
      'A native, always-on companion across Mac, iPhone, and Watch.',
    ],
  },
]

export function getAppBySlug(slug: string): AppRecord | undefined {
  const allApps = [...apps, ...unlistedApps]
  if (slug === 'fly') return allApps.find(a => a.slug === 'fly-mail')
  return allApps.find(a => a.slug === slug)
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

/** Cloudflare Email Routing address; unaffected by the pdx.software → theharborline.co redirect. */
export const legalEmail = 'help@pdx.software'
