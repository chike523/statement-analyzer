import { useEffect, useRef, useState, type CSSProperties } from 'react'
import './landing.css'

type LandingPageProps = {
  onStart: () => void
}

const DAYS = [
  { day: 'Mon', name: 'Groceries', amount: '£62', h: 0.48, cls: '' },
  { day: 'Tue', name: 'Salary in', amount: '£2.1k', h: 1, cls: 'is-easy' },
  { day: 'Wed', name: 'Rent', amount: '£980', h: 0.72, cls: '' },
  { day: 'Thu', name: 'Transit', amount: '£18', h: 0.22, cls: 'is-easy' },
  { day: 'Fri', name: 'Quiet day', amount: '£0', h: 0.06, cls: 'is-rest' },
  { day: 'Sat', name: 'Dining', amount: '£74', h: 0.55, cls: '' },
  { day: 'Sun', name: 'Bills', amount: '£41', h: 0.38, cls: 'is-today' },
] as const

const CAPABILITIES = [
  {
    name: 'CSV',
    len: 3,
    tag: 'Auto-map',
    copy: 'Headers are detected; you confirm date, description, and amount before anything lands.',
    mark: 'CSV',
    surface: 'm-surface-4',
  },
  {
    name: 'PDF',
    len: 3,
    tag: 'Text layer',
    copy: 'Digital statements are read page by page — no upload, no cloud OCR queue.',
    mark: 'PDF',
    surface: 'm-surface-2',
  },
  {
    name: 'OCR',
    len: 3,
    tag: 'On-device',
    copy: 'Scanned or photographed PDFs run through Tesseract in a Web Worker on your machine.',
    mark: 'OCR',
    surface: 'm-surface',
  },
  {
    name: 'SQL',
    len: 3,
    tag: 'DuckDB',
    copy: 'Totals, months, and payees come from real SQL in the browser — not hand-rolled loops.',
    mark: 'SQL',
    surface: 'm-surface-4',
  },
] as const

const STORIES = [
  {
    result: '3 ghost subs',
    quote: 'Caught overlapping streaming charges I had forgotten about after a bank switch.',
    meta: 'Illustrative scenario · recurring bills',
  },
  {
    result: '£0 upload',
    quote: 'Needed a clean summary for my advisor without emailing raw statements.',
    meta: 'Illustrative scenario · export report',
  },
  {
    result: '2 accounts',
    quote: 'Joined current and savings so transfers stopped looking like income.',
    meta: 'Illustrative scenario · multi-account',
  },
] as const

const FAQS = [
  {
    q: 'Does any of my statement leave this device?',
    a: 'No. Parsing, DuckDB analysis, OCR, and report generation all run in your browser tab. Closing the tab clears session data unless you turn on Save on device, which still stays in your browser’s IndexedDB.',
  },
  {
    q: 'Which file types work?',
    a: 'CSV, Excel (.xlsx / .xls), OFX/QFX, digital PDFs with a text layer, and scanned PDFs via on-device OCR.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. The core flow is open: import a statement and explore. There is no sign-up wall for analysis.',
  },
  {
    q: 'What does the export include?',
    a: 'A Markdown financial summary built on-device — cash flow, payees, recurring charges, transfers, and notes you can hand to an advisor or paste into an AI assistant.',
  },
] as const

export function LandingPage({ onStart }: LandingPageProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const [navSolid, setNavSolid] = useState(false)
  const [phoneView, setPhoneView] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Motion kit runs whenever reduced motion is off; scroll-timeline is a progressive enhancement.
    if (!reduce) {
      root.setAttribute('data-sa-live', '')
    }

    const motionNodes = root.querySelectorAll<HTMLElement>('[data-sa-motion]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add('is-in')
        }
      },
      { threshold: 0.35 },
    )
    motionNodes.forEach((node) => io.observe(node))

    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setNavSolid(y > 400)
      setNavHidden(y > lastY && y > 120)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const notes = root.querySelectorAll<HTMLElement>('[data-sa-note]')
    const noteIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const idx = Number(entry.target.getAttribute('data-sa-note') || '0')
          setPhoneView(idx)
          notes.forEach((n) => n.classList.toggle('is-on', n === entry.target))
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0.01 },
    )
    notes.forEach((n) => noteIo.observe(n))

    const contact = root.querySelector('#contact')
    const contactIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('is-lit', entry.isIntersecting)
        }
      },
      { threshold: 0.35 },
    )
    if (contact) contactIo.observe(contact)

    return () => {
      io.disconnect()
      noteIo.disconnect()
      contactIo.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const phoneClass = (index: number) =>
    ['ap-view', phoneView === index ? 'is-on' : '', index < phoneView ? 'is-under' : '']
      .filter(Boolean)
      .join(' ')

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const start = () => {
    setMenuOpen(false)
    onStart()
  }

  return (
    <div className="sa-landing" ref={rootRef}>
      <header
        id="nav"
        className={[navHidden ? 'is-hidden' : '', navSolid ? 'is-solid' : ''].filter(Boolean).join(' ')}
      >
        <a className="m-notch nav-logo" href="#curve" aria-label="Statement Analyzer home">
          <span className="nav-dot" aria-hidden="true" />
          <span className="nav-word">Analyzer</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#privacy">Privacy</a>
          <a href="#capabilities">Formats</a>
          <a href="#app">Product</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button type="button" className="m-btn nav-cta" onClick={start}>
          <span className="m-btn__label">Open app</span>
        </button>
        <button
          type="button"
          className="m-icon-btn nav-menu"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 8h14M5 16h14" />
          </svg>
        </button>
        <div className="menu" hidden={!menuOpen} role="dialog" aria-modal="true" aria-label="Menu">
          <div className="menu__top">
            <span className="menu__brand">Statement Analyzer</span>
            <button
              type="button"
              className="m-icon-btn menu__close"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 7l10 10M17 7L7 17" />
              </svg>
            </button>
          </div>
          <nav className="menu__links">
            <a href="#privacy" onClick={() => setMenuOpen(false)}>
              Privacy
            </a>
            <a href="#capabilities" onClick={() => setMenuOpen(false)}>
              Formats
            </a>
            <a href="#app" onClick={() => setMenuOpen(false)}>
              Product
            </a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>
              FAQ
            </a>
          </nav>
          <button type="button" className="m-btn-2" onClick={start}>
            <span className="m-btn__label">Analyze my statement</span>
          </button>
        </div>
      </header>

      <main>
        <section id="curve" className="l-panel m-surface-2">
          <h1 className="m-text-2 cv-title" data-sa-motion="stretch">
            Statements
            <br />
            stay here
          </h1>
          <div className="cv-grid l-panel__body">
            <div className="cv-copy">
              <p className="m-text-5">
                Import a bank statement and see income, spending, recurring bills, and odd charges —
                analyzed entirely in your browser. Nothing is uploaded.
              </p>
              <ul className="cv-cues">
                <li>
                  <span className="m-badge">CSV</span>
                  <p className="m-text">Bank exports with auto-detected columns you confirm before import.</p>
                </li>
                <li>
                  <span className="m-badge">PDF</span>
                  <p className="m-text">Digital statements and scanned pages — OCR stays on this device.</p>
                </li>
                <li>
                  <span className="m-badge">OCR</span>
                  <p className="m-text">Photographed statements are read in a Web Worker, never uploaded.</p>
                </li>
                <li>
                  <span className="m-badge">Offline</span>
                  <p className="m-text">After load, analysis runs in the tab — no account wall to start.</p>
                </li>
              </ul>
              <button type="button" className="m-btn" onClick={start}>
                <span className="m-btn__label">Analyze my statement</span>
              </button>
            </div>
            <figure className="cv-chart" aria-label="Illustrative weekly cash movement">
              <ol className="cv-days">
                {DAYS.map((d, i) => (
                  <li
                    key={d.day}
                    className={d.cls || undefined}
                    style={{ '--cv-h': d.h, '--i': i } as CSSProperties}
                  >
                    <span className="cv-track">
                      <span className="cv-bar" />
                    </span>
                    <span className="cv-day m-text-4">
                      {d.day}
                      {d.cls.includes('today') ? ' · today' : ''}
                    </span>
                    <span className="cv-name">
                      <b>{d.name}</b>
                      {d.amount}
                    </span>
                  </li>
                ))}
              </ol>
              <svg className="cv-line" viewBox="0 0 700 400" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="50,208 150,0 250,112 350,312 450,376 550,180 650,248" />
              </svg>
              <figcaption className="cv-caption m-text-4">
                Illustrative week · synthetic sample, not your data
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="privacy" className="l-panel m-surface-4">
          <div className="m-notch">
            <h2 className="m-text-2" data-sa-motion="stretch">
              Zero
              <br />
              upload
            </h2>
          </div>
          <div className="l-panel__body">
            <p className="m-text-5" style={{ maxWidth: '48ch' }}>
              Most money tools ask you to trust their servers. Statement Analyzer keeps the file, the
              math, and the report inside your browser.
            </p>
            <div className="pv-grid">
              <article className="pv-card">
                <span className="m-badge-3" data-sa-motion="drop">
                  Tab-bound
                </span>
                <h3 className="m-text-3">Session by default</h3>
                <p className="m-text">Close the tab and the working copy is gone. Opt in only if you want a local save.</p>
              </article>
              <article className="pv-card">
                <span className="m-badge-3" data-sa-motion="drop">
                  Workers
                </span>
                <h3 className="m-text-3">Heavy work off-UI</h3>
                <p className="m-text">CSV, PDF, OCR, and DuckDB run in Web Workers so the interface stays responsive.</p>
              </article>
              <article className="pv-card">
                <span className="m-badge-3" data-sa-motion="drop">
                  CSP
                </span>
                <h3 className="m-text-3">Hardened build</h3>
                <p className="m-text">Production ships a tight Content-Security-Policy — no surprise network calls for your data.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="capabilities" className="l-panel m-surface-3">
          <div className="m-notch">
            <h2 className="m-text-2" data-sa-motion="stretch">
              Bring
              <br />
              any file
            </h2>
          </div>
          <div className="l-panel__body">
            <p className="m-text-5 ds-lead">
              One importer covers the messy reality of bank exports — spreadsheets, OFX, clean PDFs, and
              scans.
            </p>
            <div className="ds-rows">
              {CAPABILITIES.map((cap) => (
                <article key={cap.name} className={`ds-row ${cap.surface}`}>
                  <h3 className="m-text-2 ds-name" style={{ '--len': cap.len } as CSSProperties}>
                    {cap.name}
                  </h3>
                  <div className="ds-info">
                    <span className="m-badge-3">{cap.tag}</span>
                    <p className="m-text">{cap.copy}</p>
                  </div>
                  <div className="ds-mark" aria-hidden="true">
                    {cap.mark}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="app" className="l-panel m-surface">
          <div className="m-notch">
            <h2 className="m-text-2" data-sa-motion="stretch">
              One tab,
              <br />
              full picture
            </h2>
          </div>
          <div className="ap-grid l-panel__body">
            <div className="ap-stage">
              <div className="ap-phone" aria-hidden="true">
                <div className="ap-screen">
                  <div className={phoneClass(0)}>
                    <header>
                      <span className="m-text-3">Overview</span>
                      <span className="m-badge-3">Local</span>
                    </header>
                    <div className="ap-card ap-card--dark">
                      <span className="m-text-4">Net this month</span>
                      <strong className="m-text-3">+£1,284</strong>
                    </div>
                    <ul className="ap-metrics">
                      <li>
                        <span className="m-text-4">In</span>
                        <strong>£4,920</strong>
                      </li>
                      <li>
                        <span className="m-text-4">Out</span>
                        <strong>£3,636</strong>
                      </li>
                    </ul>
                    <div className="ap-card ap-card--mint">
                      <span className="m-text-4">Top payee</span>
                      <strong>City Rent Co</strong>
                    </div>
                  </div>
                  <div className={phoneClass(1)}>
                    <header>
                      <span className="m-text-3">Bills</span>
                      <span className="m-badge-3">4 due</span>
                    </header>
                    <ul className="ap-steps">
                      <li>
                        <span>Streaming+</span>
                        <b>£12.99</b>
                      </li>
                      <li>
                        <span>Gym</span>
                        <b>£39.00</b>
                      </li>
                      <li>
                        <span>Phone</span>
                        <b>£28.00</b>
                      </li>
                      <li>
                        <span>Cloud drive</span>
                        <b>£9.99</b>
                      </li>
                    </ul>
                    <div className="ap-card">
                      <span className="m-text-4">Predicted next</span>
                      <strong>Streaming+ · Fri</strong>
                    </div>
                  </div>
                  <div className={phoneClass(2)}>
                    <header>
                      <span className="m-text-3">Export</span>
                      <span className="m-badge-3">MD</span>
                    </header>
                    <div className="ap-card ap-card--dark">
                      <span className="m-text-4">Report ready</span>
                      <strong className="m-text-3">financial-summary.md</strong>
                    </div>
                    <ul className="ap-steps">
                      <li>
                        <span>Executive summary</span>
                        <b>✓</b>
                      </li>
                      <li>
                        <span>Recurring + transfers</span>
                        <b>✓</b>
                      </li>
                      <li>
                        <span>Advisor prompts</span>
                        <b>✓</b>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="ap-notes">
              <p className="m-text-5 ap-lead">
                Scroll the product story. Phone screens are illustrative samples labeled for demo — your
                numbers appear only after you import.
              </p>
              <article className="ap-note is-on" data-sa-note="0">
                <h3 className="m-text-3">Overview that is actually SQL</h3>
                <p className="m-text">
                  Monthly cash flow, income, expenses, and top payees are queried from DuckDB in a worker —
                  the same engine that powers serious analytics, running locally.
                </p>
              </article>
              <article className="ap-note" data-sa-note="1">
                <h3 className="m-text-3">Bills before they surprise you</h3>
                <p className="m-text">
                  Recurring detection groups stable merchants, infers weekly/monthly/yearly cadence, and
                  predicts the next charge date.
                </p>
              </article>
              <article className="ap-note" data-sa-note="2">
                <h3 className="m-text-3">Export without the upload</h3>
                <p className="m-text">
                  Generate a Markdown brief on-device for an advisor — or paste it into an assistant — without
                  sending the raw statement anywhere.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="stories" className="l-panel m-surface-2">
          <div className="m-notch">
            <h2 className="m-text-2" data-sa-motion="stretch">
              Built for
              <br />
              real weeks
            </h2>
          </div>
          <div className="st-grid l-panel__body">
            {STORIES.map((story) => (
              <article key={story.result} className="st-card">
                <p className="st-result" data-sa-motion="drop">
                  {story.result}
                </p>
                <p className="m-text">{story.quote}</p>
                <p className="m-text-4 st-meta">{story.meta}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="l-panel m-surface-4">
          <div className="m-notch">
            <h2 className="m-text-2" data-sa-motion="stretch">
              Straight
              <br />
              answers
            </h2>
          </div>
          <div className="fq-grid l-panel__body">
            <div className="fq-side">
              <p className="m-text-5">Privacy-first means the FAQ should be boringly clear.</p>
              <button type="button" className="m-link" onClick={start}>
                <span className="m-link__label">Skip ahead — open the importer</span>
              </button>
            </div>
            <div>
              {FAQS.map((item) => (
                <details key={item.q}>
                  <summary className="m-text-3">{item.q}</summary>
                  <p className="m-text">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="l-panel m-surface-5">
          <div className="ct-shade" aria-hidden="true" />
          <div className="m-notch">
            <h2 className="m-text-2" data-sa-motion="stretch">
              Ready when
              <br />
              you are
            </h2>
          </div>
          <div className="ct-body l-panel__body">
            <div>
              <p className="m-text-5 ct-lead">
                Drop a statement in. See the shape of your month. Export a summary — all without a server
                seeing a single line.
              </p>
              <div className="ct-actions">
                <button type="button" className="m-btn" onClick={start}>
                  <span className="m-btn__label">Analyze my statement</span>
                </button>
              </div>
            </div>
            <div>
              <p className="m-text">
                Supported today: CSV, Excel, OFX/QFX, digital PDF, scanned PDF. Multi-account. Recurring,
                duplicates, transfers. Markdown export.
              </p>
            </div>
          </div>
          <div className="m-notch-2 ct-tab">
            <button type="button" className="m-btn-3" onClick={start}>
              <span className="m-btn__label">Open importer</span>
              <svg className="m-btn-3__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </button>
          </div>
        </section>
      </main>

      <footer id="footer">
        <p className="m-text-2 ft-word" style={{ '--len': 19 } as CSSProperties} data-sa-motion="stretch">
          Statement Analyzer
        </p>
        <div className="ft-row">
          <p className="m-text-4">Local-first statement clarity</p>
          <nav aria-label="Footer">
            <a href="#privacy">Privacy</a>
            <a href="#capabilities">Formats</a>
            <a href="#faq">FAQ</a>
            <button type="button" className="m-link" onClick={start}>
              <span className="m-link__label">Open app</span>
            </button>
          </nav>
          <p className="m-text-4 ft-credit">
            Design language adapted from{' '}
            <a href="https://8b.com/templates/kurvo/" target="_blank" rel="noreferrer">
              Kurvo by 8B
            </a>{' '}
            (MIT)
          </p>
        </div>
      </footer>
    </div>
  )
}
