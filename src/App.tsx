import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { InteractiveShader } from './components/InteractiveShader'
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
      {/* Soft pastel-drift shader. Pointer-events:none in CSS so the
          hero text + dots above it stay clickable. Slow timeStep
          keeps the animation calm — barely-noticeable motion. */}
      <div className="hero-shader" aria-hidden>
        <InteractiveShader timeStep={0.02} />
      </div>
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
  const target = app.cardHref ?? (app.ctaHref.startsWith('/') ? app.ctaHref : `/${app.slug}`)
  const external = target.startsWith('http') || target.startsWith('mailto:')
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
        {/* Title on its own row so a long name doesn't have to fight
            the status chip for horizontal space. The status moves to
            its own line below, rendered as a pill chip. */}
        <h3 className="app-card-title">{app.name}</h3>
        <span className="app-card-status">{app.status}</span>
        <p>{app.description}</p>
        <span className="app-card-cta">
          {app.ctaLabel}
          {external ? <ArrowUpRight size={14} aria-hidden /> : <ArrowRight size={14} aria-hidden />}
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
    <LegalPage title="Privacy Policy" updated="May 23, 2026">
      <p>
        This policy covers every product PDX Software publishes — currently App Sweep, Prompt
        Producer, Fly, and the Harborline Labs experiments — and the marketing pages at
        pdx.software. Harborline Holdings is the company behind PDX Software.
      </p>
      <h2>What each product collects</h2>
      <h3>App Sweep (macOS desktop)</h3>
      <p>
        Does not collect analytics, create accounts, transmit selected app paths, or send removal
        activity to a server. Theme, menu-bar visibility, confetti, and review-prompt state stay
        in local macOS preferences.
      </p>
      <h3>Prompt Producer (App Store)</h3>
      <p>
        The marketing site links to Prompt Producer's App Store listing. App-specific data handling
        is disclosed through the App Store privacy details and any in-app notices for that app.
      </p>
      <h3>Fly (fly.pm)</h3>
      <p>
        Stores workspace data a user creates or connects, including mail, calendar, tasks, links,
        notes, files, and storage resources. Cloudflare D1, R2, Vectorize, AutoRAG, and AI Gateway
        power the connected knowledge layer and AI search. Short-link analytics can include
        timestamp, slug, target URL, approximate geo from the request, and a browser/OS string.
      </p>
      <h2>Google user data used by Fly</h2>
      <p>
        Fly lets a user connect a Google account so the app can provide an AI-first productivity
        workspace across email, contacts, calendar, notes, tasks, links, and the user's Fly
        knowledge base. Fly's use and transfer of information received from Google APIs adheres
        to the Google API Services User Data Policy, including the Limited Use requirements.
      </p>
      <h3>Data accessed</h3>
      <p>
        When a user signs in with Google, Fly receives basic Google account identity data: the
        user's Google account id, name, email address, and profile image if Google provides one.
        When the user connects Gmail, Fly accesses Gmail profile metadata, labels, message ids,
        thread ids, message headers, recipients, senders, subjects, snippets, timestamps, message
        bodies, attachments available through the Gmail message payload, label changes, and
        history records needed for incremental sync. When the user enables Google Contacts, Fly
        accesses saved contacts and other contacts such as names, email addresses, phone numbers,
        organizations, addresses, URLs, birthdays, profile photos, and biographies when available
        from Google's People API. When the user enables Google Calendar, Fly accesses the user's
        calendar list, calendar ids, calendar names, colors, access roles, selected sync state,
        event ids, event titles, event descriptions, event links, start and end times, time zones,
        and cancellation status for selected calendars.
      </p>
      <h3>Data usage</h3>
      <p>
        Fly uses Google user data only to provide user-facing workspace features that are visible
        in the app: account login, connected inbox import, message search, AI-assisted inbox
        triage, labels, summaries, reminders, follow-up tasks, contact autocomplete, calendar
        overlays, daily overviews, calendar-linked tasks, and knowledge-base search across the
        user's connected information. Fly may process Gmail message text, contact records, and
        calendar event text through Cloudflare AI Gateway, embeddings, and retrieval services only
        to classify, summarize, search, or generate follow-up context for that user's workspace.
      </p>
      <h3>Why the Google OAuth scopes are needed</h3>
      <p>
        Fly requests <code>openid</code>, <code>email</code>, and <code>profile</code> to create
        and secure the user's Fly account and show the correct signed-in identity. Fly requests
        <code>https://www.googleapis.com/auth/gmail.modify</code> because the inbox feature must
        import messages and threads, read labels and history for incremental sync, and apply or
        update labels when the user performs inbox actions in Fly; read-only Gmail scopes would
        not support the visible label-management and mailbox-triage actions. Fly requests
        <code>https://www.googleapis.com/auth/contacts.readonly</code> to show saved Google
        contacts in recipient autocomplete and contact search. Fly requests
        <code>https://www.googleapis.com/auth/contacts.other.readonly</code> to include email
        addresses from people the user has interacted with but has not saved as formal contacts,
        which is necessary for useful compose autocomplete. Fly requests
        <code>https://www.googleapis.com/auth/calendar.readonly</code> to list calendars and show
        events in the user's workspace. Fly requests
        <code>https://www.googleapis.com/auth/calendar.events</code> only for calendar surfaces
        where the user chooses to create or update events from Fly; read-only calendar scopes
        would not allow those user-directed edits.
      </p>
      <h3>Data sharing</h3>
      <p>
        Fly does not sell Google user data, share it with advertising platforms, share it with
        data brokers, use it for retargeting or interest-based advertising, or use it to determine
        creditworthiness. Google user data is shared only with service providers needed to run the
        user-visible product: Cloudflare infrastructure services that host Fly, store the user's
        account and workspace data, cache short-lived access tokens, run Workers, D1, R2,
        Vectorize, AutoRAG, Analytics Engine, and route AI requests through Cloudflare AI Gateway.
        These providers process data only to operate Fly's app features, protect the service,
        troubleshoot abuse or security issues, or comply with law.
      </p>
      <h3>Data storage and protection</h3>
      <p>
        Fly stores connected Google account records, OAuth refresh tokens, synced mail metadata
        and message content, contact records, selected calendar settings, calendar event copies,
        generated labels, summaries, embeddings, and search indexes in Cloudflare-backed storage.
        Data is encrypted in transit with HTTPS and protected at rest by the underlying Cloudflare
        services. Access to production data is limited to the systems and operators needed to run,
        debug, secure, or legally support the service. Humans do not read Google message, contact,
        calendar, or file-derived data unless the user asks for support involving specific data,
        access is necessary to investigate abuse or security issues, or access is required by law.
      </p>
      <h3>AI and model training</h3>
      <p>
        Fly does not use Google Workspace API data to train or improve generalized AI or machine
        learning models. Google user data may be sent through Cloudflare AI Gateway or embedding
        services only to provide the user's requested Fly features, such as inbox classification,
        search, summaries, daily briefs, and follow-up suggestions inside that user's workspace.
      </p>
      <h3>Data retention and deletion</h3>
      <p>
        Fly keeps Google-derived workspace data while the user's Fly account or linked Google
        account remains active so the app can sync mail, contacts, calendars, search indexes, and
        related productivity features. A user can revoke Fly's Google access from their Google
        Account permissions page, disconnect or re-link Google inside Fly when those controls are
        available, or request deletion by emailing <a href={`mailto:${legalEmail}`}>{legalEmail}</a>.
        After a deletion request, Fly deletes the user's account data and Google-derived workspace
        data from active systems within 30 days unless retention is required for security, abuse
        prevention, legal compliance, or backup recovery. Backups and operational logs are deleted
        or overwritten on their normal retention cycle.
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
        (macOS prompts in App Sweep, connected-account auth and resource limits in Fly), abuse
        third-party services through the products, or use them to send unsolicited bulk mail.
      </p>
      <h2>App Sweep</h2>
      <p>
        You are responsible for reviewing selected apps before confirming removal. App Sweep
        moves selected bundles to Trash and asks Finder to empty Trash only when you choose that
        action. macOS may require administrator authentication or Full Disk Access. App Sweep
        cannot grant itself those permissions or bypass system prompts.
      </p>
      <h2>Prompt Producer</h2>
      <p>
        Prompt Producer is distributed through the Apple App Store. Apple's App Store terms and
        any in-app terms apply in addition to these site terms.
      </p>
      <h2>Fly</h2>
      <p>
        Fly accounts are personal to the signed-in user. Connected email, notes, files, storage,
        tasks, calendars, links, and AI search features must be used lawfully and within the limits
        shown in the product. Short links must not redirect to malware, phishing, or content that
        violates the host's terms.
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
          For Fly we'll also need the signed-in email address so we can look the account up.
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
