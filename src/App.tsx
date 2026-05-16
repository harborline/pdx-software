import { ArrowRight, Mail } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { legalEmail } from './lib/content'

type SiteMode = 'holding' | 'product'

function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return {
    pathname,
    navigate: (path: string) => {
      if (path.startsWith('http') || path.startsWith('mailto:')) {
        window.location.href = path
        return
      }

      window.history.pushState({}, '', path)
      setPathname(path)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  }
}

function getSiteMode(): SiteMode {
  if (window.location.hostname === 'pdx.software' || window.location.hostname === 'www.pdx.software')
    return 'product'

  return 'holding'
}

function resolvePath(pathname: string, mode: SiteMode) {
  if (mode === 'product' && pathname === '/')
    return '/about'

  if (pathname === '/marketing')
    return '/about'

  return pathname
}

function Shell({
  children,
  mode,
  pathname,
  navigate,
}: {
  children: React.ReactNode
  mode: SiteMode
  pathname: string
  navigate: (path: string) => void
}) {
  if (mode === 'holding') {
    return (
      <div className="site-shell holding-shell">
        <main>{children}</main>
        <footer className="holding-footer">
          <p>© 2026 Harborline Holdings</p>
        </footer>
      </div>
    )
  }

  const nav = [
    { href: '/about', label: 'About' },
    { href: '/support', label: 'Support' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ]

  return (
    <div className="site-shell">
      <header className="site-header">
        <a
          className="brand"
          href="/about"
          onClick={(event) => {
            event.preventDefault()
            navigate('/about')
          }}
        >
          <span className="brand-mark" aria-hidden="true" />
          <span>App Sweep</span>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          {nav.map((item) => (
            <a
              key={item.href}
              className={pathname === item.href ? 'is-active' : undefined}
              href={item.href}
              onClick={(event) => {
                if (item.href.startsWith('#'))
                  return

                event.preventDefault()
                navigate(item.href)
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div>
          <p>© 2026 Harborline Holdings</p>
        </div>
        <div className="footer-links">
          {[
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
            { href: '/support', label: 'Support' },
          ].map((link) => (
            <a
              href={link.href}
              key={link.href}
              onClick={(event) => {
                if (!link.href.startsWith('/'))
                  return

                event.preventDefault()
                navigate(link.href)
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}

function HomePage() {
  return (
    <section className="holding-home" aria-labelledby="holding-title">
      <div className="holding-heading">
        <h1 id="holding-title">Harborline Holdings</h1>
        <p>Portland, Oregon • United States</p>
      </div>
      <div className="holding-card-grid" aria-label="Harborline links">
        <a className="holding-card" href="https://pdx.software">
          <span>PDX Software</span>
        </a>
        <article className="holding-card is-disabled" aria-label="Coming soon">
          <span>Coming soon</span>
        </article>
      </div>
    </section>
  )
}

function AboutPage() {
  return (
    <>
      <section className="page-hero compact">
        <p className="domain">App Sweep</p>
        <h1>Force quit and trash Mac apps in one clean step.</h1>
        <p>
          App Sweep is a compact macOS utility from Harborline Holdings. It helps users review
          selected app bundles, quit matching running processes, move apps to Trash, and empty
          Trash from the same focused window.
        </p>
      </section>
      <section className="section detail-grid">
        <article>
          <h2>Built for review before removal</h2>
          <p>
            App Sweep keeps selected app paths visible before the user confirms any action. It
            moves apps to Trash rather than permanently deleting them.
          </p>
        </article>
        <article>
          <h2>Permission-aware by design</h2>
          <p>
            macOS may ask for Finder automation, Full Disk Access, or administrator approval. App
            Sweep explains those prompts and never bypasses macOS security controls.
          </p>
        </article>
      </section>
      <ContactBand />
    </>
  )
}

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="May 16, 2026">
      <p>
        This page covers App Sweep and the pdx.software product pages. Harborline Holdings operates
        the holding company site at harborline.cloud. Fly remains a separate link tracking and click
        analytics product at fly.pm.
      </p>
      <h2>App Sweep</h2>
      <p>
        App Sweep does not collect analytics, create accounts, transmit selected app paths, or send
        app-removal activity to Harborline. Settings such as theme, menu bar visibility, confetti,
        and review prompt state stay in local macOS preferences.
      </p>
      <h2>Company website</h2>
      <p>
        pdx.software is a static App Sweep product site served by Cloudflare Workers. The backend
        exposes basic product and status endpoints. We do not add advertising pixels or session
        replay.
      </p>
      <h2>Contact</h2>
      <p>
        Privacy questions can be sent to <a href={`mailto:${legalEmail}`}>{legalEmail}</a>.
      </p>
    </LegalPage>
  )
}

function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="May 16, 2026">
      <p>
        These terms apply to App Sweep and the pdx.software product pages. Product-specific services
        may include additional terms when needed.
      </p>
      <h2>Use of App Sweep</h2>
      <p>
        You are responsible for reviewing selected apps before confirming removal. App Sweep moves
        selected app bundles to Trash and may ask Finder to empty Trash only when you choose that
        action.
      </p>
      <h2>macOS permissions</h2>
      <p>
        Some apps require macOS approval, administrator authentication, Full Disk Access, or Finder
        automation permission. App Sweep cannot grant itself those permissions or bypass system
        prompts.
      </p>
      <h2>Support</h2>
      <p>
        Questions can be sent to <a href={`mailto:${legalEmail}`}>{legalEmail}</a>.
      </p>
    </LegalPage>
  )
}

function SupportPage() {
  return (
    <>
      <section className="page-hero compact">
        <p className="domain">Support</p>
        <h1>Help for App Sweep.</h1>
        <p>
          For App Sweep support, include your macOS version, the app you were trying to remove, and
          any macOS error message you saw.
        </p>
        <a className="button button-primary" href={`mailto:${legalEmail}`}>
          Email support
          <Mail size={18} aria-hidden="true" />
        </a>
      </section>
      <section className="section support-list">
        <article>
          <h2>App Sweep</h2>
          <p>
            Most removal issues come from macOS permissions or administrator-owned apps in
            /Applications. App Sweep can guide you to the right settings, but macOS may still ask
            for your password.
          </p>
        </article>
        <article>
          <h2>Fly</h2>
          <p>
            Fly remains the link tracking and click analytics product at fly.pm. Keep link tracking
            support separate from the Harborline company site when reporting issues.
          </p>
        </article>
      </section>
    </>
  )
}

function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <article className="legal-page">
      <p className="domain">Harborline Holdings</p>
      <h1>{title}</h1>
      <p className="updated">Updated {updated}</p>
      <div className="legal-copy">{children}</div>
    </article>
  )
}

function ContactBand() {
  return (
    <section id="contact" className="contact-band">
      <div>
        <h2>Contact support</h2>
        <p>Product support, App Store review questions, and company inquiries can start here.</p>
      </div>
      <a className="button button-primary" href={`mailto:${legalEmail}`}>
        {legalEmail}
        <ArrowRight size={18} aria-hidden="true" />
      </a>
    </section>
  )
}

export default function App() {
  const { pathname, navigate } = usePathname()
  const mode = getSiteMode()
  const currentPath = resolvePath(pathname, mode)
  const page = useMemo(() => {
    if (mode === 'holding')
      return <HomePage />

    switch (currentPath) {
      case '/marketing':
      case '/about':
        return <AboutPage />
      case '/privacy':
        return <PrivacyPage />
      case '/terms':
      case '/tos':
        return <TermsPage />
      case '/support':
        return <SupportPage />
      default:
        return <HomePage />
    }
  }, [currentPath, mode])

  return (
    <Shell mode={mode} pathname={currentPath} navigate={navigate}>
      {page}
    </Shell>
  )
}
