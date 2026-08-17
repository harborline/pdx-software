/**
 * The products currently listed on Harborline's public catalog. Keep this
 * module free of React imports so the Worker can use the same source of truth.
 */
export const LISTED_PRODUCTS = [
  {
    slug: 'keepout',
    name: 'Keepout',
    category: 'Private notes for Mac, iPhone, and iPad',
    url: 'https://harborline.cloud/keepout',
  },
  {
    slug: 'free-speech-tts',
    name: 'Free Speech TTS',
    category: 'Text to speech for macOS',
    url: 'https://pdx.software/free-speech',
  },
] as const
