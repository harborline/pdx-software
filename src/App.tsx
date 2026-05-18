import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { type AppRecord, apps, getAppBySlug, homeCarouselLines, legalEmail, principles } from './lib/content'

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
  if (mode === 'product' && pathname === '/about') return '/'
  if (pathname === '/marketing') return '/'
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

  const featured = apps.filter(a => a.featured)
  const nav = [
    { href: '/', label: 'Apps' },
    ...featured.map(a => ({ href: `/${a.slug}`, label: a.name })),
    { href: '/support', label: 'Support' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ]

  return (
    <div className="site-shell">
      <header className="site-header">
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            navigate('/')
          }}
        >
          <span className="brand-mark" aria-hidden="true" />
          <span>PDX Software</span>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          {nav.map(item => (
            <a
              key={item.href}
              className={pathname === item.href ? 'is-active' : undefined}
              href={item.href}
              onClick={(event) => {
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
          <p>© 2026 Harborline Holdings · PDX Software</p>
        </div>
        <div className="footer-links">
          {[
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
            { href: '/support', label: 'Support' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => {
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

function HoldingHome() {
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

function HeroCarousel({ navigate }: { navigate: (path: string) => void }) {
  const lines = useMemo(homeCarouselLines, [])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (lines.length <= 1) return
    const id = window.setInterval(() => {
      setIndex(i => (i + 1) % lines.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [lines.length])

  const current = lines[index]
  if (!current) return null

  return (
    <section className="hero-carousel">
      <p className="domain">PDX Software</p>
      <div className="hero-line-wrap" aria-live="polite">
        {/* Render only the active line. The `key` change forces React
            to remount the h1 on every index advance which restarts the
            fade-in keyframe; no absolute-position layering required, so
            the headline stays naturally centred under the parent's
            text-align rather than collapsing into a zero-width inset. */}
        <h1 key={index} className="hero-line">{current.line}</h1>
      </div>
      <p className="hero-byline">
        Currently:{' '}
        <a
          href={`/${current.app.slug}`}
          onClick={(e) => {
            e.preventDefault()
            navigate(`/${current.app.slug}`)
          }}
        >
          {current.app.name}
        </a>
      </p>
      <div className="hero-dots" role="tablist" aria-label="Hero slides">
        {lines.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`hero-dot ${i === index ? 'is-active' : ''}`}
            aria-label={`Slide ${i + 1}`}
            aria-selected={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  )
}

function AppCard({ app, navigate }: { app: AppRecord, navigate: (path: string) => void }) {
  const Icon = app.Icon
  const target = app.ctaHref.startsWith('/') ? app.ctaHref : `/${app.slug}`
  return (
    <a
      className={`app-card ${app.featured ? 'is-featured' : ''}`}
      href={target}
      onClick={(event) => {
        event.preventDefault()
        navigate(target)
      }}
    >
      <div className="app-card-logo" style={{ background: `${app.accent}1a`, color: app.accent }}>
        <Icon size={app.featured ? 28 : 22} aria-hidden="true" />
      </div>
      <div className="app-card-body">
        <div className="app-card-head">
          <h3>{app.name}</h3>
          <span className="app-card-status">{app.status}</span>
        </div>
        <p>{app.description}</p>
        <span className="app-card-cta">
          {app.ctaLabel}
          <ArrowRight size={14} aria-hidden />
        </span>
      </div>
    </a>
  )
}

function HomePage({ navigate }: { navigate: (path: string) => void }) {
  const featured = apps.filter(a => a.featured)
  const rest = apps.filter(a => !a.featured)
  return (
    <>
      <HeroCarousel navigate={navigate} />

      <section className="section">
        <h2 className="section-title">Featured apps</h2>
        <div className="app-grid is-featured-grid">
          {featured.map(app => (
            <AppCard key={app.slug} app={app} navigate={navigate} />
          ))}
        </div>
      </section>

      {rest.length > 0 && (
        <section className="section">
          <h2 className="section-title">More from PDX Software</h2>
          <div className="app-grid">
            {rest.map(app => (
              <AppCard key={app.slug} app={app} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      <section className="section principles">
        <h2 className="section-title">How we build</h2>
        <div className="principles-grid">
          {principles.map((p) => {
            const PIcon = p.Icon
            return (
              <article key={p.title} className="principle-card">
                <PIcon size={20} aria-hidden />
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            )
          })}
        </div>
      </section>

      <ContactBand />
    </>
  )
}

function AppMarketingPage({ app, navigate }: { app: AppRecord, navigate: (path: string) => void }) {
  const Icon = app.Icon
  const external = app.ctaHref.startsWith('http') || app.ctaHref.startsWith('mailto:')
  return (
    <>
      <section className="page-hero compact">
        <div className="page-hero-logo" style={{ background: `${app.accent}1a`, color: app.accent }}>
          <Icon size={28} aria-hidden />
        </div>
        <p className="domain">{app.name}</p>
        <h1>{app.tagline}</h1>
        <p>{app.description}</p>
        <a
          className="button button-primary"
          href={app.ctaHref}
          onClick={(event) => {
            if (external) return
            event.preventDefault()
            navigate(app.ctaHref)
          }}
        >
          {app.ctaLabel}
          {external ? <ArrowUpRight size={16} aria-hidden /> : <ArrowRight size={16} aria-hidden />}
        </a>
      </section>
      {app.features.length > 0 && (
        <section className="section detail-grid">
          {app.features.map(f => (
            <article key={f.title}>
              <h2>{f.title}</h2>
              <p>{f.body}</p>
            </article>
          ))}
        </section>
      )}
      <ContactBand />
    </>
  )
}

function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="May 17, 2026">
      <p>
        This policy covers every product PDX Software publishes — currently App Sweep, Fly Mail,
        Fly, and the Harborline Labs experiments — and the marketing pages at pdx.software.
        Harborline Holdings is the company behind PDX Software.
      </p>
      <h2>What each product collects</h2>
      <h3>App Sweep (macOS desktop)</h3>
      <p>
        Does not collect analytics, create accounts, transmit selected app paths, or send removal
        activity to a server. Theme, menu-bar visibility, confetti, and review-prompt state stay
        in local macOS preferences.
      </p>
      <h3>Fly Mail (mail.fly.pm)</h3>
      <p>
        Stores the contents of mailboxes a user explicitly hosts on Fly Mail or imports from a
        Gmail account they've linked. Cloudflare D1 + R2 are the storage backends. Sent-message
        tracking via fly.pm is opt-out per send; inbound third-party tracking pixels are stripped
        and outbound link clicks route through a no-referrer proxy. AI labelling runs through
        Cloudflare AI Gateway with the dynamic-route convention; the underlying provider sees
        only the content needed to classify a single message at a time.
      </p>
      <h3>Fly (fly.pm)</h3>
      <p>
        Records short-link clicks in Cloudflare Analytics Engine: timestamp, slug, target URL,
        approximate geo (city/region/country) from the request, and a User-Agent-derived
        browser/OS string. Per-user link ownership is tied to a Fly account.
      </p>
      <h3>Marketing site (pdx.software)</h3>
      <p>
        Static pages served by Cloudflare Workers with a small Hono backend for product + status
        endpoints. No advertising pixels, no session replay, no third-party analytics.
      </p>
      <h2>Shared infrastructure</h2>
      <p>
        Every product runs on Cloudflare Workers in the same account. Cloudflare may keep
        operational logs of HTTPS requests under their privacy policy; PDX Software does not
        retain those logs ourselves.
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
    <LegalPage title="Terms of Service" updated="May 17, 2026">
      <p>
        These terms cover every product PDX Software publishes and the marketing pages at
        pdx.software. Each product may extend these with product-specific terms surfaced inside
        the product itself.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Use the products lawfully and as documented. Don't try to circumvent platform security
        (macOS prompts in App Sweep, Cloudflare auth in Fly Mail, rate limits in Fly), abuse
        third-party services through the products, or use them to send unsolicited bulk mail.
      </p>
      <h2>App Sweep</h2>
      <p>
        You are responsible for reviewing selected apps before confirming removal. App Sweep
        moves selected bundles to Trash and asks Finder to empty Trash only when you choose that
        action. macOS may require administrator authentication or Full Disk Access. App Sweep
        cannot grant itself those permissions or bypass system prompts.
      </p>
      <h2>Fly Mail</h2>
      <p>
        Fly Mail accounts are personal to the signed-in user. Outbound mail uses Cloudflare Email
        Service and is subject to its sending limits. Tracked sends include a transparent pixel
        and rewritten links unless the user disables tracking on a per-send basis.
      </p>
      <h2>Fly</h2>
      <p>
        Short links must not redirect to malware, phishing, or content that violates the host's
        terms. We reserve the right to disable any link that does. Per-account link quotas are
        documented in the Fly dashboard.
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
        <h1>Help across every PDX Software product.</h1>
        <p>
          Include the product name, the macOS or browser version, and any error message you saw.
          For Fly Mail and Fly we'll also need the signed-in email address so we can look the
          account up.
        </p>
        <a className="button button-primary" href={`mailto:${legalEmail}`}>
          Email support
          <Mail size={18} aria-hidden />
        </a>
      </section>
      <section className="section support-list">
        {apps.map(a => (
          <article key={a.slug}>
            <h2>{a.name}</h2>
            <p>{a.description}</p>
          </article>
        ))}
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
      <p className="domain">PDX Software</p>
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
        <p>Product support, App Store review questions, and company inquiries all start here.</p>
      </div>
      <a className="button button-primary" href={`mailto:${legalEmail}`}>
        {legalEmail}
        <ArrowRight size={18} aria-hidden />
      </a>
    </section>
  )
}

export default function App() {
  const { pathname, navigate } = usePathname()
  const mode = getSiteMode()
  const currentPath = resolvePath(pathname, mode)
  const page = useMemo(() => {
    if (mode === 'holding') return <HoldingHome />

    // App marketing pages: /<slug>
    if (currentPath.startsWith('/') && currentPath.length > 1) {
      const slug = currentPath.slice(1).replace(/\/.*$/, '')
      const app = getAppBySlug(slug)
      if (app) return <AppMarketingPage app={app} navigate={navigate} />
    }

    switch (currentPath) {
      case '/':
        return <HomePage navigate={navigate} />
      case '/privacy':
        return <PrivacyPage />
      case '/terms':
      case '/tos':
        return <TermsPage />
      case '/support':
        return <SupportPage />
      default:
        return <HomePage navigate={navigate} />
    }
  }, [currentPath, mode, navigate])

  return (
    <Shell mode={mode} pathname={currentPath} navigate={navigate}>
      {page}
    </Shell>
  )
}
