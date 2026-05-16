import { ArrowRight, Mail } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { companies, legalEmail, principles } from './lib/content'

type StatusResponse = {
  ok: boolean
  service: string
  company: string
}

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
    return '/marketing'

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
  const nav = mode === 'holding'
    ? [
        { href: '#companies', label: 'Companies' },
        { href: '#principles', label: 'Principles' },
        { href: '#contact', label: 'Contact' },
      ]
    : [
        { href: '/marketing', label: 'Marketing' },
        { href: '/support', label: 'Support' },
        { href: '/privacy', label: 'Privacy' },
        { href: '/terms', label: 'Terms' },
      ]

  const brandHref = mode === 'holding' ? '/' : '/marketing'
  const brandLabel = mode === 'holding' ? 'Harborline Holdings' : 'App Sweep'
  const footerLinks = [
    { href: mode === 'holding' ? 'https://pdx.software/privacy' : '/privacy', label: 'Privacy' },
    { href: mode === 'holding' ? 'https://pdx.software/terms' : '/terms', label: 'Terms' },
    { href: mode === 'holding' ? 'https://pdx.software/support' : '/support', label: 'Support' },
  ]

  return (
    <div className="site-shell">
      <header className="site-header">
        <a
          className="brand"
          href={brandHref}
          onClick={(event) => {
            event.preventDefault()
            navigate(brandHref)
          }}
        >
          <span className="brand-mark" aria-hidden="true" />
          <span>{brandLabel}</span>
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
          <p className="muted">
            harborline.cloud is the holding company. pdx.software serves App Sweep pages.
          </p>
        </div>
        <div className="footer-links">
          {footerLinks.map((link) => (
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
  const [status, setStatus] = useState<StatusResponse | null>(null)

  useEffect(() => {
    fetch('/api/status')
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => setStatus(payload as StatusResponse | null))
      .catch(() => setStatus(null))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="domain">harborline.cloud</p>
          <h1>Quiet software for useful work.</h1>
          <p className="hero-lede">
            We build and operate focused tools for Mac productivity, publishing, automation, and
            small business workflows.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={`mailto:${legalEmail}`}>
              Contact
              <Mail size={18} aria-hidden="true" />
            </a>
            <a className="button button-secondary" href="#companies">
              View companies
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="status-line" aria-live="polite">
            <span className={status?.ok ? 'status-dot is-online' : 'status-dot'} />
            {status?.ok ? `${status.service} Worker API online` : 'Cloudflare Worker API checking'}
          </div>
        </div>
      </section>

      <section id="companies" className="section">
        <div className="section-heading">
          <h2>Products we operate</h2>
          <p>
            Harborline keeps the holding company separate from the products: this site is for the
            company, Fly handles link tracking, and product pages stay product-specific.
          </p>
        </div>
        <div className="company-grid">
          {companies.map((company) => (
            <a className="company-card" href={company.href} key={company.name}>
              <company.Icon size={22} aria-hidden="true" />
              <span className="company-status">{company.status}</span>
              <h3>{company.name}</h3>
              <p>{company.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="principles" className="section principles">
        <div className="section-heading">
          <h2>Operating principles</h2>
          <p>Simple rules that keep the company and the products understandable.</p>
        </div>
        <div className="principle-list">
          {principles.map((principle) => (
            <article className="principle-row" key={principle.title}>
              <div className="icon-frame">
                <principle.Icon size={20} aria-hidden="true" />
              </div>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ContactBand />
    </>
  )
}

function MarketingPage() {
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
        <h2>Contact Harborline Holdings</h2>
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
    switch (currentPath) {
      case '/marketing':
        return <MarketingPage />
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
  }, [currentPath])

  return (
    <Shell mode={mode} pathname={currentPath} navigate={navigate}>
      {page}
    </Shell>
  )
}
