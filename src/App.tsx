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

function appDestination(app: AppRecord) {
  return app.cardHref ?? app.ctaHref
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
    ...featured.map(a => ({ href: appDestination(a), label: a.name })),
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
  const currentDestination = appDestination(current.app)

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
          href={currentDestination}
          onClick={(e) => {
            e.preventDefault()
            navigate(currentDestination)
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
  const target = appDestination(app)
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
    <LegalPage title="Privacy Policy" updated="May 24, 2026">
      <p>
        This policy covers every product PDX Software publishes or supports, including App Sweep,
        Prompt Producer, Fly, Book Cook, AI Dev Sidebar, Spooool, Make The App, alex, and the
        Harborline Labs experiments. It also covers the marketing pages at pdx.software.
        Harborline Holdings is the company behind PDX Software.
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
      <h3>Book Cook (book-cook.com)</h3>
      <p>
        Stores account identity, author workspace settings, book projects, outlines, manuscript
        drafts, chapter notes, voice profiles, research briefs, generated text, export jobs, and
        support messages the user creates or imports. Book Cook uses Cloudflare-backed storage,
        Workers, Durable Objects, Workflows, R2, D1, and AI services to draft, organize, render,
        export, and support long-form publishing work.
      </p>
      <h3>AI Dev Sidebar (Chrome extension)</h3>
      <p>
        AI Dev Sidebar processes browser and developer context only when the user installs the
        extension, grants Chrome permissions, or invokes a visible side-panel, context-menu,
        capture, automation, or local-tool feature. Its single purpose is to provide a Chrome side
        panel for local AI terminals, page inspection, captures, bookmarks, cookies, and browser
        workflow tools.
      </p>
      <p>
        The extension can process the following Chrome extension data categories when needed for
        user-facing features: website content and page resources, active-tab URL/title/fav icon,
        web browsing activity, bookmarks, history, downloads, cookies and other authentication
        information, extension settings, browser settings, screen/tab/audio captures, user-entered
        search queries, local terminal output, local AI CLI responses, and synced resource
        references. Page content may include personal information or personal communications if the
        user chooses to inspect, capture, summarize, automate, or send that page to a configured
        local or remote tool.
      </p>
      <p>
        The requested Chrome permissions are used as follows: <code>storage</code> and
        <code>unlimitedStorage</code> store extension settings, onboarding state, captures, and
        workflow state in the browser profile; <code>sidePanel</code> displays the primary
        interface; <code>tabs</code>, <code>activeTab</code>, <code>webNavigation</code>,
        <code>scripting</code>, and host access to <code>&lt;all_urls&gt;</code> support page
        inspection, selected-page automation, visible-tab capture, and user-directed tools across
        sites the user chooses to work with; <code>contextMenus</code> adds explicit browser menu
        actions; <code>tabCapture</code>, <code>desktopCapture</code>, and
        <code>offscreen</code> support screen, tab, audio, and recording workflows;
        <code>bookmarks</code>, <code>history</code>, <code>cookies</code>,
        <code>downloads</code>, <code>browsingData</code>, <code>privacy</code>, and
        <code>contentSettings</code> support browser-data management surfaces shown in the
        extension; <code>declarativeNetRequest</code> supports user-visible request rules and
        inspection workflows; <code>management</code> supports extension/profile diagnostics;
        <code>search</code> sends user-entered searches through Chrome's default search provider;
        <code>alarms</code> runs scheduled local extension work; and
        <code>nativeMessaging</code> connects to an optional local native host selected by the
        user for terminals, local files, local AI tools, and developer automation.
      </p>
      <p>
        By default, AI Dev Sidebar stores extension data locally in the user's browser profile and,
        where configured, in the user's local native host. PDX Software does not receive browsing
        history, page content, cookies, captures, terminal output, or prompts by default. If the
        user configures a hosted sidebar API, AI service, automation endpoint, or other third-party
        integration, the extension sends only the data needed for that requested feature to the
        configured service over HTTPS or the platform transport provided by Chrome/native
        messaging.
      </p>
      <p>
        PDX Software does not sell extension data, share it with advertising platforms, use it for
        retargeting or interest-based advertising, transfer it to data brokers, or use it to
        determine creditworthiness. Humans do not read extension user data unless the user asks for
        support involving specific data, access is necessary to investigate abuse or security
        issues, or access is required by law. The use of information received from Chrome APIs and
        Google APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use
        requirements.
      </p>
      <p>
        Users can delete extension data by clearing the extension's browser storage, removing the
        extension, clearing relevant Chrome browsing data, deleting local native-host files, or
        requesting deletion of any PDX-hosted account data by emailing{' '}
        <a href={`mailto:${legalEmail}`}>{legalEmail}</a>.
      </p>
      <h3>Spooool (spooool.com)</h3>
      <p>
        Stores account identity, channel/profile data, uploaded videos, titles, descriptions,
        thumbnails, captions or transcripts when provided, comments, moderation actions, watch
        history, playback position, subscription or payment metadata, and operational security
        logs needed to run a video platform. Spooool uses Cloudflare Workers, R2, Stream, D1,
        Durable Objects, Analytics Engine, and related service providers for upload, playback,
        search, moderation, abuse prevention, analytics, and account support.
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
    <LegalPage title="Terms of Service" updated="May 23, 2026">
      <p>
        These terms govern access to PDX Software products, product websites, browser extensions,
        desktop apps, hosted services, APIs, and support channels. By using a product, creating an
        account, installing an extension, or visiting a hosted app, you agree to these terms and to
        any product-specific notices shown inside that product.
      </p>
      <h2>Accounts and responsibility</h2>
      <p>
        You are responsible for the accounts, devices, browser profiles, API keys, files, prompts,
        links, videos, mailboxes, calendars, manuscripts, and other content you connect to a PDX
        Software product. Keep credentials secure and use each product only for accounts and data
        you are allowed to access.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Use the products lawfully and as documented. Do not bypass platform security, attack or
        overload the service, scrape or exfiltrate data you do not control, upload malware, evade
        moderation, infringe intellectual-property rights, send unsolicited bulk mail, create
        phishing or deceptive flows, or use the products to violate a third-party service's terms.
        We may throttle, suspend, remove content, or terminate access when needed to protect users,
        infrastructure, legal obligations, or third-party services.
      </p>
      <h2>User content</h2>
      <p>
        You keep ownership of content you create, upload, connect, or import. You grant PDX
        Software the limited permission needed to host, store, process, transform, display, search,
        transmit, back up, and support that content so the selected product can operate. You are
        responsible for having the rights and consents needed for anything you submit, including
        emails, files, contacts, videos, manuscripts, prompts, browser data, and links.
      </p>
      <h2>AI features and outputs</h2>
      <p>
        AI-assisted features can summarize, classify, draft, search, recommend, or transform user
        content. Review important outputs before relying on them, publishing them, deleting data,
        sending messages, changing calendar events, or making business, legal, medical, financial,
        or safety decisions. AI output may be incomplete, inaccurate, similar to output generated
        for others, or affected by the quality of the inputs and connected data.
      </p>
      <h2>Third-party services</h2>
      <p>
        Some products connect to platforms such as Apple, Google, Cloudflare, Brave or Chromium
        browsers, payment processors, email providers, storage providers, AI model providers, and
        local developer tools. Your use of those integrations remains subject to the third party's
        own terms, limits, account permissions, and availability. PDX Software is not responsible
        for third-party service outages, policy changes, data returned by those services, or actions
        you take in those connected accounts.
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
      <h2>Book Cook</h2>
      <p>
        Book Cook helps authors organize and generate publishing materials, but you remain
        responsible for reviewing manuscripts, research, claims, citations, exports, covers, audio,
        marketing copy, rights clearance, and marketplace submissions before publishing or selling
        them.
      </p>
      <h2>Spooool</h2>
      <p>
        Spooool users are responsible for uploaded videos, captions, thumbnails, comments, and
        channel activity. Do not upload content you do not have rights to distribute, unlawful
        content, exploitative content, malware, or content intended to harass, deceive, or evade
        moderation. We may remove or restrict content and accounts to comply with law, platform
        obligations, rights-holder requests, abuse reports, or infrastructure limits.
      </p>
      <h2>AI Dev Sidebar</h2>
      <p>
        AI Dev Sidebar is a developer tool for browser profiles and local workflows you
        control. You are responsible for any page data, cookies, browsing history, recordings,
        local CLI output, automation commands, or synced resources you choose to expose to the
        extension or connected tools.
      </p>
      <h2>Payments and subscriptions</h2>
      <p>
        Paid features, usage limits, trials, and renewals may vary by product and billing provider.
        Fees are charged through the storefront or payment provider shown at purchase time. Unless
        a product-specific policy or applicable law says otherwise, fees are non-refundable after
        access, usage, export, or subscription benefits have been delivered.
      </p>
      <h2>Availability and changes</h2>
      <p>
        Products may be experimental, changed, interrupted, rate-limited, or discontinued. We may
        update features, models, infrastructure, integrations, limits, prices, and legal terms as
        the products evolve. We try to preserve user data where practical, but you should keep your
        own backups of important files, manuscripts, videos, exports, prompts, links, and records.
      </p>
      <h2>Intellectual property</h2>
      <p>
        PDX Software products, code, branding, interfaces, documentation, and service design are
        owned by Harborline Holdings or its licensors. These terms do not grant permission to copy,
        resell, reverse engineer, or create a competing hosted service from non-public product
        components except where an open-source license expressly allows it.
      </p>
      <h2>Privacy</h2>
      <p>
        Product data handling is described in the <a href="/privacy">Privacy Policy</a>. If these
        terms and the Privacy Policy describe the same data practice differently, the Privacy Policy
        controls for that privacy issue.
      </p>
      <h2>Disclaimers and liability</h2>
      <p>
        Products are provided as-is and as-available to the fullest extent permitted by law. We do
        not promise uninterrupted service, error-free output, preservation of every item of data, or
        fitness for a particular use. To the fullest extent permitted by law, PDX Software and
        Harborline Holdings are not liable for indirect, incidental, consequential, special,
        exemplary, or punitive damages, lost profits, lost revenue, lost data, or loss of goodwill.
        Our total liability for a product is limited to the amount you paid for that product in the
        12 months before the claim, or 100 USD if you paid nothing.
      </p>
      <h2>Indemnity</h2>
      <p>
        You agree to defend and indemnify PDX Software and Harborline Holdings from claims, losses,
        liabilities, damages, costs, and expenses arising from your content, your misuse of a
        product, your violation of these terms, or your violation of law or third-party rights.
      </p>
      <h2>Termination</h2>
      <p>
        You may stop using the products at any time. We may suspend or terminate access if needed
        for security, abuse prevention, nonpayment, legal compliance, product discontinuation, or
        violation of these terms. Termination does not remove obligations that by their nature
        should survive, including payment obligations, content responsibility, disclaimers,
        liability limits, and indemnity.
      </p>
      <h2>Support</h2>
      <p>
        Questions, deletion requests, legal notices, and support requests can be sent to{' '}
        <a href={`mailto:${legalEmail}`}>{legalEmail}</a>. These terms are governed by the laws of
        Oregon, United States, without regard to conflict-of-law rules, unless applicable law
        requires a different venue or governing law.
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
