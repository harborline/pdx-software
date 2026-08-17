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
}

export const apps: AppRecord[] = [
  {
    slug: LISTED_PRODUCTS[0].slug,
    name: LISTED_PRODUCTS[0].name,
    tagline: 'Private, local AI notes.',
    description:
      'Keepout keeps your notes wherever you want them to be. Encrypted by default, you can also easily share a finished draft with Substack for publishing.',
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
  },
  {
    slug: LISTED_PRODUCTS[1].slug,
    name: LISTED_PRODUCTS[1].name,
    tagline: 'Text to speech, local or cloud.',
    description:
      'A small macOS menu bar app for reading selected text aloud with free on-device voices and optional BYOK cloud providers, ElevenLabs and Cartesia.',
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
  },
]

export function getAppBySlug(slug: string): AppRecord | undefined {
  const allApps = [...apps, ...unlistedApps]
  if (slug === 'fly') return allApps.find(a => a.slug === 'fly-mail')
  return allApps.find(a => a.slug === slug)
}

export const principles = [
  {
    title: 'Purpose-driven product studio',
    body: 'Each product starts with a narrow job and earns complexity only when it makes that job clearer.',
    Icon: Compass,
  },
  {
    title: 'Local, private, offline',
    body: 'Desktop utilities respect the device boundary; cloud products are explicit about what they store.',
    Icon: ShieldCheck,
  },
  {
    title: 'By People, for people',
    body: "If it doesn't add value to the person using the product, then it shouldn't be in the product.",
    Icon: Hammer,
  },
]

/** Cloudflare Email Routing address; unaffected by the pdx.software → theharborline.co redirect. */
export const legalEmail = 'help@pdx.software'
