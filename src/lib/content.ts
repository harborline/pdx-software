import type { LucideIcon } from 'lucide-react'
import { AppWindow, ChartNoAxesCombined, Compass, Hammer, ShieldCheck } from 'lucide-react'

export type Company = {
  name: string
  description: string
  href: string
  status: string
  Icon: LucideIcon
}

export const companies: Company[] = [
  {
    name: 'App Sweep',
    description:
      'A compact macOS utility for force quitting selected apps, moving them to Trash, and emptying Trash from one focused interface.',
    href: 'https://pdx.software/about',
    status: 'Mac utility',
    Icon: AppWindow,
  },
  {
    name: 'Fly',
    description:
      'A link tracking and click analytics product for short links, redirects, and lightweight campaign measurement.',
    href: 'https://fly.pm',
    status: 'Link tracking',
    Icon: ChartNoAxesCombined,
  },
  {
    name: 'Harborline Labs',
    description:
      'Small experiments around publishing workflows, automation helpers, and practical tools for independent operators.',
    href: 'mailto:help@pdx.software',
    status: 'In development',
    Icon: Hammer,
  },
]

export const principles = [
  {
    title: 'Focused products',
    body: 'Each product starts with a narrow job and earns complexity only when it makes that job clearer.',
    Icon: Compass,
  },
  {
    title: 'Local-first where it matters',
    body: 'Desktop utilities should respect the device boundary; cloud products should be explicit about what they store.',
    Icon: ShieldCheck,
  },
  {
    title: 'Useful over loud',
    body: 'The company site stays quiet because the products are meant to be judged by whether they solve real work.',
    Icon: Hammer,
  },
]

export const legalEmail = 'help@pdx.software'
