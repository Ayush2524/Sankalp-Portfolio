'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { contentSystem, pages, site, type MediaItem } from './data'
import { CONTACT_EMAIL, CONTACT_ENDPOINT } from './config'

const cut = 'cut'
const CONTACT_EVENT = 'portfolio:open-contact'

type YouTubePlayer = {
  destroy: () => void
  getCurrentTime: () => number
  isMuted: () => boolean
  mute: () => void
  pauseVideo: () => void
  playVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setOption?: (module: string, option: string, value: unknown) => void
  setPlaybackQuality?: (quality: string) => void
  setVolume: (volume: number) => void
  unMute: () => void
}

type YouTubeApi = {
  Player: new (element: HTMLElement, options: {
    videoId: string
    playerVars: Record<string, number | string>
    events: {
      onReady?: (event: { target: YouTubePlayer }) => void
      onStateChange?: (event: { data: number; target: YouTubePlayer }) => void
      onError?: () => void
    }
  }) => YouTubePlayer
  PlayerState: { PLAYING: number }
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (youtubeApiPromise) return youtubeApiPromise
  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error('YouTube API unavailable'))
    }
    let script = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener('error', () => reject(new Error('YouTube API failed to load')), { once: true })
  })
  return youtubeApiPromise
}

function withTimeout<T>(promise: Promise<T>, timeout: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Timed out')), timeout)
    promise.then(value => {
      window.clearTimeout(timer)
      resolve(value)
    }, error => {
      window.clearTimeout(timer)
      reject(error)
    })
  })
}

function disableYouTubeCaptions(player: YouTubePlayer) {
  try {
    player.setOption?.('captions', 'track', {})
  } catch {
    // YouTube can omit the captions module until playback starts.
  }
}

function requestHighestQuality(player: YouTubePlayer) {
  try {
    player.setPlaybackQuality?.('hd1080')
  } catch {
    // YouTube auto-selects quality from player size/bandwidth and can ignore this hint.
  }
}

function navigate(path: string) {
  const target = new URL(path, location.origin)
  const changePage = target.pathname !== location.pathname
  if (target.pathname === location.pathname && target.hash === location.hash) return
  if (changePage) document.body.classList.add('transitioning')
  setTimeout(() => {
    history.pushState({}, '', path)
    dispatchEvent(new PopStateEvent('popstate'))
    document.body.classList.remove('transitioning')
  }, changePage ? 350 : 0)
}

function Link({ href, children, className = '', onClick }: { href: string; children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <a className={className} href={href} onClick={(e) => {
    onClick?.()
    if (href.startsWith('/')) { e.preventDefault(); navigate(href) }
  }}>{children}</a>
}

function CutButton({ children, href = '#', dark = false, outline = false }: { children: React.ReactNode; href?: string; dark?: boolean; outline?: boolean }) {
  return <Link href={href} className={`button ${dark ? 'button-dark' : ''} ${outline ? 'button-outline' : ''}`}><span>{children}</span></Link>
}

function ContactButton({ children, dark = false, className = '' }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return <button type="button" className={`button ${dark ? 'button-dark' : ''} ${className}`} onClick={e => dispatchEvent(new CustomEvent(CONTACT_EVENT, { detail: e.currentTarget }))}><span>{children}</span></button>
}

function MediaSlot({ aspect = '16:9', label = 'MEDIA', dark = false }: { aspect?: string; label?: string; dark?: boolean }) {
  return <div className={`${cut} media-slot ${dark ? 'media-dark' : ''}`} data-aspect={aspect} aria-label={`${label} placeholder`}>
    <span className="tick tl" /><span className="plus">+</span><span className="tick br" />
  </div>
}

function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(location.hash.slice(1))
  useEffect(() => {
    if (location.pathname !== '/') return
    const sections = site.nav.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(visible.target.id)
    }, { rootMargin: '-80px 0px -55% 0px', threshold: [0, .1, .5] })
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])
  return <nav className="nav">
    <Link href="/" className="brand">Sankalp</Link>
    <div className={`nav-links ${open ? 'open' : ''}`}>
      {site.nav.map(x => <Link key={x} className={active === x ? 'active' : ''} href={`/#${x}`} onClick={() => setOpen(false)}>{x}</Link>)}
    </div>
    <ContactButton>Let's Talk</ContactButton>
    <button className="menu" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? 'CLOSE' : 'MENU'}</button>
  </nav>
}

function Footer() {
  return <footer><div className="footer-top"><h2>Have a brand that deserves<br />to be <em>remembered?</em></h2><ContactButton dark>Let's talk ↗</ContactButton></div>
    <div className="footer-bottom"><strong>Sankalp</strong><div>
      <a href={site.social.instagram.url} target="_blank" rel="noopener noreferrer" aria-label={site.social.instagram.ariaLabel}>{site.social.instagram.label}</a>
      <a href={site.social.linkedin.url} target="_blank" rel="noopener noreferrer" aria-label={site.social.linkedin.ariaLabel}>{site.social.linkedin.label}</a>
    </div></div></footer>
}

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => e.isIntersecting && el.classList.add('shown'), { threshold: .12 })
    ob.observe(el); return () => ob.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}

const HERO_HEADLINE = 'I build brands that people remember, trust, and engage with.'
const HERO_STATIC_TEXT = 'I build brands that people '
const HERO_TYPED_WORDS = [
  { text: 'remember,', emphasis: true },
  { text: 'trust,', emphasis: false },
  { text: 'and', emphasis: false },
  { text: 'engage', emphasis: false },
  { text: 'with.', emphasis: false },
]
const HERO_TYPED_LENGTH = HERO_TYPED_WORDS.reduce((length, word, index) => length + word.text.length + (index ? 1 : 0), 0)

function TypewriterHeadline() {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const [typedCount, setTypedCount] = useState(reducedMotion ? HERO_TYPED_LENGTH : 0)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (reducedMotion) return
    const headline = headlineRef.current
    const hero = headline?.closest('.hero')
    if (!hero) return
    let timer = 0
    let deadline = 0
    let remaining = 600
    let nextStep: (() => void) | null = null
    let heroVisible = false
    let pageVisible = !document.hidden
    let count = 0

    const canRun = () => heroVisible && pageVisible
    const armTimer = () => {
      if (!nextStep || !canRun()) return
      deadline = performance.now() + remaining
      timer = window.setTimeout(() => {
        timer = 0
        const step = nextStep
        nextStep = null
        step?.()
      }, remaining)
    }
    const schedule = (step: () => void, delay: number) => {
      window.clearTimeout(timer)
      nextStep = step
      remaining = delay
      armTimer()
    }
    const pause = () => {
      if (!timer) return
      remaining = Math.max(0, deadline - performance.now())
      window.clearTimeout(timer)
      timer = 0
    }
    const resume = () => {
      if (timer || !nextStep || !canRun()) return
      armTimer()
    }
    const typeCharacter = () => {
      count += 1
      setTypedCount(count)
      if (count >= HERO_TYPED_LENGTH) schedule(deleteCharacter, 2200)
      else schedule(typeCharacter, 70)
    }
    const deleteCharacter = () => {
      count -= 1
      setTypedCount(count)
      if (count <= 0) schedule(typeCharacter, 500)
      else schedule(deleteCharacter, 35)
    }
    schedule(typeCharacter, 600)

    const observer = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting
      if (canRun()) resume()
      else pause()
    })
    observer.observe(hero)
    const onVisibilityChange = () => {
      pageVisible = !document.hidden
      if (canRun()) resume()
      else pause()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearTimeout(timer)
    }
  }, [reducedMotion])

  let characterOffset = 0
  return <h1 ref={headlineRef} aria-label={HERO_HEADLINE} data-typed-count={typedCount}>
    <span aria-hidden="true">{HERO_STATIC_TEXT}</span>
    <span className="typewriter-text" aria-hidden="true">
      {!reducedMotion && typedCount === 0 && <span className="typewriter-start-caret" />}
      {HERO_TYPED_WORDS.map((word, wordIndex) => {
        const spaceIndex = characterOffset
        if (wordIndex) characterOffset += 1
        const wordStart = characterOffset
        characterOffset += word.text.length
        const characters = word.text.split('').map((character, characterIndex) => {
          const globalIndex = wordStart + characterIndex
          const visible = globalIndex < typedCount
          const underlined = word.emphasis && character !== ','
          const caret = !reducedMotion && visible && globalIndex === typedCount - 1
          return <span className={`typewriter-char ${visible ? 'is-visible' : ''} ${underlined ? 'is-underlined' : ''} ${caret ? 'has-caret' : ''}`} key={`${word.text}-${characterIndex}`}>{character}</span>
        })
        const contents = word.emphasis
          ? <em className="typewriter-word">{characters}</em>
          : <span className="typewriter-word">{characters}</span>
        const spaceVisible = spaceIndex < typedCount
        const spaceCaret = !reducedMotion && wordIndex > 0 && spaceVisible && spaceIndex === typedCount - 1
        return <Fragment key={word.text}>{wordIndex > 0 && <span className={`typewriter-char typewriter-space ${spaceVisible ? 'is-visible' : ''} ${spaceCaret ? 'has-caret' : ''}`}> </span>}{contents}</Fragment>
      })}
    </span>
  </h1>
}

function HeroVideo() {
  const video = site.hero.video
  const frame = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameVisible = useRef(false)
  const userPausedRef = useRef(false)
  const hideControlsTimer = useRef(0)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [previewPlaying, setPreviewPlaying] = useState(false)
  const [previewMuted, setPreviewMuted] = useState(true)
  const [controlsVisible, setControlsVisible] = useState(false)

  const syncPreview = () => {
    const el = videoRef.current
    if (!el) return
    if (frameVisible.current && !document.hidden && !userPausedRef.current) el.play().catch(() => {})
    else el.pause()
  }

  useEffect(() => {
    const el = frame.current
    if (!el) return
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
    const previewDisabled = reducedMotion || saveData
    let disposed = false
    let pageLoaded = document.readyState === 'complete'
    let started = false
    let idleHandle = 0
    let delayHandle = 0

    const schedulePreview = () => {
      if (!pageLoaded || previewDisabled || !frameVisible.current || started || idleHandle || delayHandle) return
      const run = () => {
        idleHandle = 0
        delayHandle = 0
        if (disposed || !frameVisible.current) return
        started = true
        setShouldLoad(true)
      }
      if (window.requestIdleCallback) idleHandle = window.requestIdleCallback(run)
      else delayHandle = window.setTimeout(run, 600)
    }
    const onLoad = () => {
      pageLoaded = true
      schedulePreview()
    }
    if (pageLoaded) schedulePreview()
    else addEventListener('load', onLoad, { once: true })

    const observer = new IntersectionObserver(([entry]) => {
      frameVisible.current = entry.isIntersecting
      if (entry.isIntersecting) schedulePreview()
      syncPreview()
    }, { threshold: .05 })
    observer.observe(el)
    const onVisibilityChange = () => syncPreview()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      disposed = true
      observer.disconnect()
      removeEventListener('load', onLoad)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (idleHandle) window.cancelIdleCallback(idleHandle)
      window.clearTimeout(delayHandle)
    }
  }, [])

  const showControls = () => {
    setControlsVisible(true)
    window.clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = window.setTimeout(() => setControlsVisible(false), 2600)
  }
  const hideControlsNow = () => {
    window.clearTimeout(hideControlsTimer.current)
    setControlsVisible(false)
  }
  useEffect(() => {
    showControls()
    return () => window.clearTimeout(hideControlsTimer.current)
  }, [])

  const togglePlay = () => {
    const el = videoRef.current
    if (!el) return
    if (previewPlaying) {
      el.pause()
      userPausedRef.current = true
    } else {
      el.play().catch(() => {})
      userPausedRef.current = false
    }
    showControls()
  }
  const toggleMute = () => {
    const el = videoRef.current
    if (!el) return
    const next = !previewMuted
    el.muted = next
    if (!next) el.volume = 1
    setPreviewMuted(next)
    showControls()
  }

  return <>
    <div ref={frame} className="hero-video" onPointerMove={showControls} onPointerEnter={showControls} onPointerLeave={hideControlsNow} onClick={showControls}>
      <video ref={videoRef} className="hero-native-video" poster={video.poster} src={shouldLoad ? video.src : undefined} autoPlay muted loop playsInline preload="none" onPlay={() => setPreviewPlaying(true)} onPause={() => setPreviewPlaying(false)} onCanPlay={syncPreview} />
      <div className={`video-controls ${controlsVisible ? 'is-visible' : ''}`}>
        <button type="button" className="video-toggle-button" aria-label={previewPlaying ? 'Pause video' : 'Play video'} onClick={togglePlay} onFocus={showControls}>
          {previewPlaying
            ? <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true"><rect x="2" y="1" width="6" height="20" /><rect x="12" y="1" width="6" height="20" /></svg>
            : <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true"><path d="M1 1L19 11L1 21Z" /></svg>}
        </button>
        {previewMuted && <span className="video-sound-hint mono">SOUND OFF ↘</span>}
        <button type="button" className="video-mute-button" aria-label={previewMuted ? 'Unmute video' : 'Mute video'} onClick={toggleMute} onFocus={showControls}>
          {previewMuted
            ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 9l5 6M21 9l-5 6" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 9c1.5 1.6 1.5 4.4 0 6M19 6c3.3 3.2 3.3 8.8 0 12" /></svg>}
        </button>
      </div>
    </div>
  </>
}

function Hero() {
  return <section className="hero">
    <Nav />
    <div className="hero-text">
      <div className="hero-heading"><p className="mono"><i /> BRAND &amp; CREATIVE LEAD / INDIA</p>
        <TypewriterHeadline /></div>
      <div className="hero-lead"><p>I'm Sankalp. I work at the intersection of brand strategy, creative direction, storytelling and distribution.</p>
        <div className="actions"><CutButton href="#work">View my work →</CutButton><CutButton href="#about" outline>About me</CutButton></div></div>
      <span className="registration reg-left">+</span><span className="registration reg-right">+</span>
    </div>
    <HeroVideo />
    <div className="video-caption mono"><span>HI, I'M SANKALP / 1:48</span><span>MUTED PREVIEW · USE THE SPEAKER ICON FOR SOUND</span></div>
    <div className="marquee"><div>BRAND · CREATIVE · CONTENT · DISTRIBUTION · BRAND · CREATIVE · CONTENT · DISTRIBUTION ·</div></div>
  </section>
}

function useDialog(open: boolean, close: () => void, dialogRef: React.RefObject<HTMLElement | null>, opener: HTMLElement | null) {
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = dialogRef.current
    const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    requestAnimationFrame(() => (dialog?.querySelector(focusableSelector) as HTMLElement | null)?.focus())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(element => !element.hasAttribute('hidden'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      removeEventListener('keydown', onKeyDown)
      opener?.focus()
    }
  }, [open])
}

type ContactField = 'name' | 'email' | 'message'

function ContactModal({ open, close, opener }: { open: boolean; close: () => void; opener: HTMLElement | null }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [values, setValues] = useState({ name: '', email: '', message: '', _gotcha: '' })
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({})
  const [sending, setSending] = useState(false)
  const [failure, setFailure] = useState(false)
  const [successName, setSuccessName] = useState('')
  useDialog(open, close, panelRef, opener)
  useEffect(() => {
    if (!open) return
    setValues({ name: '', email: '', message: '', _gotcha: '' })
    setErrors({})
    setSending(false)
    setFailure(false)
    setSuccessName('')
  }, [open])

  const validate = (field: ContactField, value: string) => {
    if (field === 'name' && !value.trim()) return 'Please enter your name.'
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email.'
    if (field === 'message' && value.trim().length < 10) return 'Tell me a little more (at least 10 characters).'
    return ''
  }
  const validateField = (field: ContactField) => setErrors(current => ({ ...current, [field]: validate(field, values[field]) }))
  const updateField = (field: keyof typeof values, value: string) => {
    setValues(current => ({ ...current, [field]: value }))
    if (field !== '_gotcha' && errors[field]) setErrors(current => ({ ...current, [field]: validate(field, value) }))
  }
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return
    const nextErrors = {
      name: validate('name', values.name),
      email: validate('email', values.email),
      message: validate('message', values.message),
    }
    const activeErrors = Object.fromEntries(Object.entries(nextErrors).filter(([, message]) => message))
    setErrors(activeErrors)
    const firstInvalid = (Object.keys(nextErrors) as ContactField[]).find(field => nextErrors[field])
    if (firstInvalid) {
      panelRef.current?.querySelector<HTMLElement>(`#contact-${firstInvalid}`)?.focus()
      return
    }
    const firstName = values.name.trim().split(/\s+/)[0]
    if (values._gotcha) {
      setSuccessName(firstName)
      return
    }
    setSending(true)
    setFailure(false)
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), message: values.message.trim(), _subject: 'New message from your portfolio' }),
      })
      if (!response.ok) throw new Error('Contact request failed')
      setSuccessName(firstName)
    } catch {
      setFailure(true)
    } finally {
      setSending(false)
    }
  }

  const fieldProps = (field: ContactField) => ({
    id: `contact-${field}`,
    name: field,
    value: values[field],
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
    onBlur: () => validateField(field),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateField(field, event.target.value),
  })

  return <div className={`contact-modal ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open} onMouseDown={event => event.target === event.currentTarget && close()}>
    <div className="contact-wipe" aria-hidden="true" />
    <div className="contact-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <svg className="cut-outline" viewBox="0 0 560 1000" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,0 536,0 560,24 560,1000 0,1000" /></svg>
      <button type="button" className="dialog-close" aria-label="Close contact form" onClick={close}>×</button>
      <div className={`contact-content ${successName ? 'is-success' : ''}`}>
        {successName ? <div className="contact-success">
          <div className="success-mark" aria-hidden="true"><svg viewBox="0 0 56 56"><path d="M15 29l9 9 18-21" /></svg></div>
          <p className="mono">MESSAGE SENT</p>
          <h2>Thank you, {successName}.</h2>
          <p>Your message is in. I'll get back to you soon.</p>
          <button type="button" className="button button-outline" onClick={close}><span>Close</span></button>
        </div> : <>
          <div className="contact-header"><p className="mono">LET'S TALK</p><h2 id="contact-title">Have a brand that deserves to be <em>remembered?</em></h2><p>Tell me a bit about it and I'll get back to you.</p></div>
          <form noValidate onSubmit={submit}>
            {failure && <div className="form-failure" role="alert"><span>Couldn't send that. Please try again.</span>{CONTACT_EMAIL && <> <a href={`mailto:${CONTACT_EMAIL}`}>Or email me directly at {CONTACT_EMAIL}</a></>}</div>}
            <div className="form-field"><label htmlFor="contact-name">Name</label><input {...fieldProps('name')} type="text" autoComplete="name" required />{errors.name && <p id="contact-name-error">{errors.name}</p>}</div>
            <div className="form-field"><label htmlFor="contact-email">Email</label><input {...fieldProps('email')} type="email" autoComplete="email" required />{errors.email && <p id="contact-email-error">{errors.email}</p>}</div>
            <div className="form-field"><label htmlFor="contact-message">Message</label><textarea {...fieldProps('message')} rows={5} autoComplete="off" required />{errors.message && <p id="contact-message-error">{errors.message}</p>}</div>
            <div className="honeypot" aria-hidden="true"><label htmlFor="contact-gotcha">Leave this empty</label><input id="contact-gotcha" name="_gotcha" value={values._gotcha} onChange={event => updateField('_gotcha', event.target.value)} tabIndex={-1} autoComplete="off" /></div>
            <button type="submit" className="button contact-submit" disabled={sending}><span>{sending ? 'Sending...' : 'Send message ↗'}{sending && <i className="sending-loader" aria-hidden="true"><b /><b /><b /></i>}</span></button>
          </form>
        </>}
      </div>
    </div>
  </div>
}

function easeOut(value: number) {
  const x1 = .22
  const y1 = 1
  const x2 = .36
  const y2 = 1
  const sample = (t: number, a1: number, a2: number) => 3 * (1 - t) * (1 - t) * t * a1 + 3 * (1 - t) * t * t * a2 + t * t * t
  const slope = (t: number, a1: number, a2: number) => 3 * (1 - t) * (1 - t) * a1 + 6 * (1 - t) * t * (a2 - a1) + 3 * t * t * (1 - a2)
  let t = value
  for (let i = 0; i < 6; i += 1) {
    const currentSlope = slope(t, x1, x2)
    if (Math.abs(currentSlope) < .0001) break
    t -= (sample(t, x1, x2) - value) / currentSlope
  }
  return sample(Math.min(1, Math.max(0, t)), y1, y2)
}

function StatValue({ stat, index, active, reducedMotion }: {
  stat: (typeof site.stats)[number]
  index: number
  active: boolean
  reducedMotion: boolean
}) {
  const [display, setDisplay] = useState(reducedMotion || stat.target === undefined ? stat.final : `0${stat.suffix}`)
  const [revealed, setRevealed] = useState(reducedMotion)
  useEffect(() => {
    if (reducedMotion) {
      setDisplay(stat.final)
      setRevealed(true)
      return
    }
    if (!active) {
      setDisplay(stat.target === undefined ? stat.final : `0${stat.suffix}`)
      setRevealed(false)
      return
    }
    let frame = 0
    const delay = window.setTimeout(() => {
      setRevealed(true)
      if (stat.target === undefined) return
      const started = performance.now()
      const update = (now: number) => {
        const progress = Math.min(1, (now - started) / 1200)
        setDisplay(`${Math.round(stat.target! * easeOut(progress))}${stat.suffix}`)
        if (progress < 1) frame = requestAnimationFrame(update)
      }
      frame = requestAnimationFrame(update)
    }, index * 80)
    return () => {
      window.clearTimeout(delay)
      cancelAnimationFrame(frame)
    }
  }, [active, index, reducedMotion, stat])
  return <strong className={`stat-value ${stat.target === undefined ? 'stat-fade' : ''} ${revealed ? 'is-visible' : ''}`} aria-label={stat.final}>
    <span className="stat-measure" aria-hidden="true">{stat.final}</span>
    <span className="stat-animated" aria-hidden="true">{display}</span>
  </strong>
}

function Stats() {
  const gridRef = useRef<HTMLDivElement>(null)
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const [active, setActive] = useState(reducedMotion)
  const phaseRef = useRef<'idle' | 'playing' | 'done'>(reducedMotion ? 'done' : 'idle')
  const resetTimerRef = useRef(0)
  const doneTimerRef = useRef(0)
  useEffect(() => {
    if (reducedMotion) return
    const grid = gridRef.current
    if (!grid) return
    const clearReset = () => {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = 0
    }
    const reset = () => {
      resetTimerRef.current = 0
      window.clearTimeout(doneTimerRef.current)
      doneTimerRef.current = 0
      phaseRef.current = 'idle'
      setActive(false)
    }
    const play = () => {
      if (phaseRef.current !== 'idle') return
      phaseRef.current = 'playing'
      setActive(true)
      doneTimerRef.current = window.setTimeout(() => {
        phaseRef.current = 'done'
        doneTimerRef.current = 0
      }, 1200 + (site.stats.length - 1) * 80)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio === 0) {
        clearReset()
        resetTimerRef.current = window.setTimeout(reset, 150)
        return
      }
      clearReset()
      if (entry.intersectionRatio >= .4) play()
    }, { threshold: [0, .4] })
    observer.observe(grid)
    return () => {
      observer.disconnect()
      clearReset()
      window.clearTimeout(doneTimerRef.current)
    }
  }, [reducedMotion])
  return <div className={`stats ${active ? 'is-active' : ''}`} ref={gridRef}>
    {site.stats.map((stat, index) => <div className="stat" key={stat.label}>
      <StatValue stat={stat} index={index} active={active} reducedMotion={reducedMotion} />
      <span className="stat-label" style={{ transitionDelay: reducedMotion ? '0ms' : `${index * 80 + 200}ms` }}>{stat.label}</span>
    </div>)}
  </div>
}

function Home() {
  return <><Hero />
    <main>
      <section className="impact dark-section section" id="impact"><Reveal><p className="mono lime">PROOF OVER PROMISES</p><h2>{site.impactHeading.lead} <em>{site.impactHeading.emphasis}</em> <span className="impact-qualifier">{site.impactHeading.qualifier}</span></h2></Reveal>
        <Stats />
        <p className="mono support-label">Content supported and shared by -</p>
        <div className="supporters">{site.supporters.map(supporter => <article key={supporter.name}><a className="supporter-media supporter-media-button" href={supporter.url} target="_blank" rel="noopener noreferrer" aria-label={supporter.ariaLabel}><img src={supporter.image} alt={`${supporter.name} portrait`} /></a><h3>{supporter.name}</h3><p>{supporter.role}</p><a className="supporter-action" href={supporter.url} target="_blank" rel="noopener noreferrer" aria-label={supporter.ariaLabel}>View content →</a></article>)}</div>
      </section>
      <section className="statement section"><Reveal><h2>I don't just make things <em>look good.</em></h2></Reveal><Reveal><div className="statement-copy"><p>I ask <mark>why they should exist</mark>, who they are for, and what they should say.</p><p>Then I turn that thinking into identities, stories and distribution systems that <mark>earn attention and retention.</mark></p></div></Reveal></section>
      <section className="work section" id="work"><Reveal><p className="mono">THREE CHAPTERS</p><h2>Work that earned <em>attention</em></h2></Reveal>
        <div className="chapter-list">{site.chapters.map(c => <Link key={c.href} href={c.href} className="chapter-link">
          <article className="chapter-card"><picture>{c.coverMobile && <source media="(max-width: 767px)" srcSet={c.coverMobile}/>}<img src={c.cover} alt={`${c.title} cover artwork`} /></picture></article>
          <div className="chapter-caption"><span>{c.title}</span><span className="arrow"><i>→</i></span></div></Link>)}</div>
      </section>
      <section className="about section" id="about"><Reveal><h2>About <em>me</em></h2></Reveal><div className="about-grid"><div className="about-portrait"><img src={site.aboutPortrait} alt="Sankalp Bhitkar writing in a notebook" /></div><div>{site.about.map((p,i) => <p key={i}>{p}</p>)}</div></div></section>
    </main><Footer /></>
}

function Carousel({ title = 'Product snapshot', count = 5, slides = [] }: { title?: string; count?: number; slides?: string[] }) {
  const [index, setIndex] = useState(0)
  const total = slides.length || count
  const showPrevious = () => setIndex(current => (current - 1 + total) % total)
  const showNext = () => setIndex(current => (current + 1) % total)
  return <div className="carousel" tabIndex={0} role="region" aria-roledescription="carousel" aria-label={title} onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); showNext() } if (e.key === 'ArrowLeft') { e.preventDefault(); showPrevious() } }}>
    <div className="carousel-head"><span className="mono">{title}</span><div><button type="button" aria-label={`Previous slide in ${title}`} onClick={showPrevious}>←</button><button type="button" aria-label={`Next slide in ${title}`} onClick={showNext}>→</button></div></div>
    {slides.length > 0 ? <img className="carousel-media" src={slides[index]} alt={`${title}, slide ${index + 1} of ${total}`} /> : <MediaSlot aspect="16:9" label={`${title} SLIDE ${index+1}`} />}
    <div className="carousel-progress"><span className="mono" aria-live="polite">{String(index+1).padStart(2,'0')} / {String(total).padStart(2,'0')}</span><div>{Array.from({length:total},(_,i)=><i className={i===index?'active':''} key={i}/>)}</div></div>
  </div>
}

function ContentItem({ item }: { item: MediaItem }) {
  const slides = item.slides?.filter(Boolean) ?? []
  const [slide, setSlide] = useState(0)
  const showPrevious = () => setSlide(current => (current - 1 + slides.length) % slides.length)
  const showNext = () => setSlide(current => (current + 1) % slides.length)

  return <article className="content-item"><div className="content-stage">{slides.length > 0 ? <div className="content-carousel" tabIndex={0} role="region" aria-roledescription="carousel" aria-label={item.title} onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); showNext() } if (e.key === 'ArrowLeft') { e.preventDefault(); showPrevious() } }}>
    <img className="content-media" src={slides[slide]} alt={`${item.title}, slide ${slide + 1} of ${slides.length}`} />
    <div className="content-carousel-controls"><button type="button" onClick={showPrevious} aria-label={`Previous slide in ${item.title}`}>←</button><span className="mono" aria-live="polite">{String(slide + 1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span><button type="button" onClick={showNext} aria-label={`Next slide in ${item.title}`}>→</button></div>
  </div> : item.src ? <img className="content-media" src={item.src} alt={item.title} /> : <MediaSlot dark aspect={item.aspect} label={item.type} />}{item.type==='video' && <button className="mini-play">▶</button>}</div>
    <div className="content-caption"><p>{item.caption}</p></div></article>
}

function ContentAccordion() {
  const [open, setOpen] = useState<number | null>(0)
  return <section className="content-system dark-section section"><h2>Content <em>system</em></h2>
    <div className="accordion">{contentSystem.map((row,i)=><div className={`acc-row ${open===i?'active':''}`} key={row.title}>
      <button className="acc-head" aria-expanded={open===i} onClick={()=>setOpen(open===i?null:i)}><span>{row.title} <small>— {row.metric}</small></span><b>+</b></button>
      <div className="acc-panel"><div>{row.items.map((item,j)=><ContentItem item={item} key={j}/>)}</div></div>
    </div>)}</div></section>
}

function ChapterHero({ label,date,title, media=[] }: { label:string; date:string; title:string; media?: { src:string; alt:string }[] }) {
  return <header className="chapter-hero"><Nav/><div className="chapter-hero-body"><div className="chapter-meta"><span className="mono chapter-chip">{label}</span><span className="mono">{date}</span></div><h1>{title}</h1><div className="chapter-rule" />
    {media.length > 0 && <div className="hero-media">{media.map(item=><img src={item.src} alt={item.alt} key={item.src}/>)}</div>}</div></header>
}

function Narrative({ paragraphs }: { paragraphs:string[] }) {
  return <div className="narrative">{paragraphs.map((p,i)=><p className={(i===1||p.startsWith('How')||p.startsWith("The idea"))?'big':''} key={i}>{p}</p>)}</div>
}

function Novare() {
  const p=pages.novare
  return <><ChapterHero {...p} media={p.heroMedia}/><main><section className="section light"><Narrative paragraphs={p.intro}/></section><ContentAccordion/>
    <section className="section arena"><div className="section-title"><div><h2>ArenaX <em>(gaming product)</em></h2><p>Storytime: From a hiring marketplace to a battle arena.</p></div><a className="button arenax-link" href={p.arenaxUrl} target="_blank" rel="noopener noreferrer" aria-label="Try ArenaX (opens in a new tab)"><span>Try ArenaX</span></a></div><img className="arena-banner" src={p.arenaBanner} alt="ArenaX logo beside a cherry blossom tree and moon" /><Narrative paragraphs={p.arena}/><Carousel slides={p.productSlides}/><Narrative paragraphs={p.ux}/><Carousel title="Storyboard carousel" slides={p.storyboardSlides}/></section></main><Footer/></>
}

type FreelanceProject = (typeof pages.freelance.projects)[number]

function PdfViewer({ project, close, opener }: { project: FreelanceProject; close: () => void; opener: HTMLElement | null }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)
  useDialog(true, close, dialogRef, opener)
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!loaded) setPreviewFailed(true)
    }, 4000)
    return () => window.clearTimeout(timeout)
  }, [loaded])
  return <div className="pdf modal" onMouseDown={event => event.target === event.currentTarget && close()}>
    <div className="pdf-shell" ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${project.name} brand project`}>
      <div className="pdf-head"><h2>{project.name}</h2><div>
        <a href={project.pdfView} target="_blank" rel="noopener noreferrer">{pages.freelance.pdfViewer.openLabel}</a>
        <button type="button" className="dialog-close pdf-close" aria-label={pages.freelance.pdfViewer.closeAriaLabel} onClick={close}>×</button>
      </div></div>
      <div className="pdf-frame">
        <iframe src={project.pdfPreview} title={`${project.name} brand project PDF`} onLoad={() => { setLoaded(true); setPreviewFailed(false) }} />
        {previewFailed && <div className="pdf-fallback"><p>{pages.freelance.pdfViewer.fallbackMessage}</p><a className="button" href={project.pdfView} target="_blank" rel="noopener noreferrer"><span>{pages.freelance.pdfViewer.fallbackAction}</span></a></div>}
      </div>
    </div>
  </div>
}

function Freelance() {
  const p=pages.freelance
  const [pdf, setPdf] = useState<{ project: FreelanceProject; opener: HTMLElement } | null>(null)
  const openProject = (project: FreelanceProject, opener: HTMLButtonElement) => {
    if (matchMedia('(max-width: 767px)').matches) {
      window.open(project.pdfView, '_blank', 'noopener,noreferrer')
      return
    }
    setPdf({ project, opener })
  }
  return <><ChapterHero {...p}/><main><section className="section light"><Narrative paragraphs={p.intro}/></section><section className="lime-band"><h2>{p.statement}</h2></section>
    <section className="section projects"><div className="project-grid">{p.projects.map(project=><button className={`${cut} project-card`} key={project.name} onClick={event=>openProject(project, event.currentTarget)}><div className="logo-plate"><img src={project.image} alt={`${project.name} brand identity exploration`} /></div><div><strong>{project.name}</strong><span className="mono">BRANDING &nbsp; ↗</span></div></button>)}</div></section></main>{pdf&&<PdfViewer project={pdf.project} opener={pdf.opener} close={()=>setPdf(null)}/>}<Footer/></>
}

type PersonalVideo = (typeof pages.personal.videos)[number]

function PersonalVideoTile({ video, open, onPointerMove, onPointerEnter, onPointerLeave }: {
  video: PersonalVideo
  open: (opener: HTMLButtonElement) => void
  onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void
  onPointerEnter: () => void
  onPointerLeave: () => void
}) {
  const maxResolution = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`
  const fallback = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
  const [thumbnail, setThumbnail] = useState(maxResolution)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const useFallback = () => {
    setLoaded(false)
    if (thumbnail === maxResolution) setThumbnail(fallback)
    else setFailed(true)
  }
  return <button type="button" className="personal-video-button" aria-label={`Play ${video.title}`} onClick={event => open(event.currentTarget)} onPointerMove={onPointerMove} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
    <div className={`${cut} media-slot personal-video-tile`} data-aspect="4:5">
      <span className="tick tl" /><span className="plus">+</span><span className="tick br" />
      {!failed && <img className={loaded ? 'is-loaded' : ''} src={thumbnail} loading="lazy" decoding="async" alt={`Thumbnail for ${video.title}`} onLoad={event => {
        if (event.currentTarget.naturalWidth < 200) useFallback()
        else setLoaded(true)
      }} onError={useFallback} />}
      <span className={`personal-play ${loaded ? 'is-visible' : ''}`} aria-hidden="true"><i /></span>
    </div>
  </button>
}

function Lightbox(props: {
  type: 'youtube'
  videos: PersonalVideo[]
  initialIndex: number
  opener: HTMLElement
  close: () => void
}) {
  return <YouTubeGalleryLightbox {...props} />
}

function YouTubeGalleryLightbox({ type, videos, initialIndex, opener, close }: {
  type: 'youtube'
  videos: PersonalVideo[]
  initialIndex: number
  opener: HTMLElement
  close: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const switchTimerRef = useRef(0)
  const frameRequestRef = useRef(0)
  const playerTarget = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const hideControlsTimer = useRef(0)
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = matchMedia('(max-width: 767px)').matches
  const [index, setIndex] = useState(initialIndex)
  const [frameMounted, setFrameMounted] = useState(true)
  const [switching, setSwitching] = useState(false)
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const video = videos[index]
  useDialog(true, close, dialogRef, opener)

  const showControls = () => {
    setControlsVisible(true)
    window.clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = window.setTimeout(() => setControlsVisible(false), 2600)
  }
  const hideControlsNow = () => {
    window.clearTimeout(hideControlsTimer.current)
    setControlsVisible(false)
  }
  useEffect(() => () => window.clearTimeout(hideControlsTimer.current), [])

  useEffect(() => {
    if (!frameMounted) return
    const target = playerTarget.current
    if (!target) return
    let disposed = false
    let ready = false
    setFailed(false)
    setPlaying(false)
    showControls()
    const failureTimer = window.setTimeout(() => {
      if (!ready) setFailed(true)
    }, 6000)
    void withTimeout(loadYouTubeApi(), 6000).then(api => {
      if (disposed) return
      playerRef.current = new api.Player(target, {
        videoId: video.id,
        playerVars: {
          autoplay: 1,
          mute: 0,
          controls: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          disablekb: 1,
          iv_load_policy: 3,
          fs: 0,
          enablejsapi: 1,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: event => {
            ready = true
            setFailed(false)
            disableYouTubeCaptions(event.target)
            requestHighestQuality(event.target)
            try {
              setMuted(event.target.isMuted())
            } catch {}
            event.target.playVideo()
          },
          onStateChange: event => {
            disableYouTubeCaptions(event.target)
            requestHighestQuality(event.target)
            setPlaying(event.data === api.PlayerState.PLAYING)
          },
          onError: () => setFailed(true),
        },
      })
    }).catch(() => {
      if (!disposed) setFailed(true)
    })
    return () => {
      disposed = true
      window.clearTimeout(failureTimer)
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [frameMounted, index])

  const togglePlay = () => {
    const player = playerRef.current
    if (!player) return
    try {
      if (playing) player.pauseVideo()
      else player.playVideo()
    } catch {}
    showControls()
  }
  const toggleMute = () => {
    const player = playerRef.current
    if (!player) return
    const next = !muted
    try {
      if (next) player.mute()
      else {
        player.unMute()
        player.setVolume(100)
      }
    } catch {}
    setMuted(next)
    showControls()
  }

  const showVideo = (nextIndex: number) => {
    if (switching) return
    setSwitching(true)
    switchTimerRef.current = window.setTimeout(() => {
      setFrameMounted(false)
      setIndex((nextIndex + videos.length) % videos.length)
      frameRequestRef.current = requestAnimationFrame(() => {
        setFrameMounted(true)
        setSwitching(false)
      })
    }, reducedMotion ? 0 : 200)
  }
  const showPrevious = () => showVideo(index - 1)
  const showNext = () => showVideo(index + 1)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPrevious()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNext()
      }
    }
    addEventListener('keydown', onKeyDown)
    return () => removeEventListener('keydown', onKeyDown)
  }, [index, switching])
  useEffect(() => () => {
    window.clearTimeout(switchTimerRef.current)
    cancelAnimationFrame(frameRequestRef.current)
  }, [])

  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`
  return <div className={`lightbox lightbox-${type}`} onMouseDown={event => event.target === event.currentTarget && close()}>
    <div className="youtube-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${video.title} video player`}>
      <div className="youtube-topbar"><span className="mono">{video.title.toUpperCase()} / {String(videos.length).padStart(2, '0')}</span><button type="button" className="youtube-close" aria-label="Close video lightbox" onClick={close}>×</button></div>
      <div className="youtube-stage">
        {!mobile && <button type="button" className="youtube-arrow youtube-arrow-prev" aria-label="Play previous reel" onClick={showPrevious}>←</button>}
        <div className="youtube-frame" data-aspect={video.aspect}>
          <div className={`youtube-player ${switching ? 'is-switching' : ''}`} onPointerMove={showControls} onPointerEnter={showControls} onPointerLeave={hideControlsNow} onClick={showControls}>
            {frameMounted && <div key={video.id} className="youtube-player-target"><div ref={playerTarget} /></div>}
            <div className={`video-controls ${controlsVisible ? 'is-visible' : ''}`}>
              <button type="button" className="video-toggle-button" aria-label={playing ? 'Pause video' : 'Play video'} onClick={togglePlay} onFocus={showControls}>
                {playing
                  ? <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true"><rect x="2" y="1" width="6" height="20" /><rect x="12" y="1" width="6" height="20" /></svg>
                  : <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true"><path d="M1 1L19 11L1 21Z" /></svg>}
              </button>
              <button type="button" className="video-mute-button" aria-label={muted ? 'Unmute video' : 'Mute video'} onClick={toggleMute} onFocus={showControls}>
                {muted
                  ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 9l5 6M21 9l-5 6" /></svg>
                  : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 9c1.5 1.6 1.5 4.4 0 6M19 6c3.3 3.2 3.3 8.8 0 12" /></svg>}
              </button>
            </div>
            {failed && <div className="youtube-fallback"><p>Can't play this video here.</p><a className="button" href={watchUrl} target="_blank" rel="noopener noreferrer"><span>Watch on YouTube ↗</span></a></div>}
          </div>
        </div>
        {!mobile && <button type="button" className="youtube-arrow youtube-arrow-next" aria-label="Play next reel" onClick={showNext}>→</button>}
      </div>
      {mobile && <div className="youtube-mobile-controls"><button type="button" aria-label="Play previous reel" onClick={showPrevious}>←</button><button type="button" aria-label="Play next reel" onClick={showNext}>→</button></div>}
    </div>
  </div>
}

function Personal() {
  const p = pages.personal
  const cursorRef = useRef<HTMLDivElement>(null)
  const [light, setLight] = useState<{ index: number; opener: HTMLButtonElement } | null>(null)
  const moveCursor = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse' || !cursorRef.current) return
    cursorRef.current.style.transform = `translate(${event.clientX}px,${event.clientY}px)`
  }
  const showCursor = () => cursorRef.current?.classList.add('is-visible')
  const hideCursor = () => cursorRef.current?.classList.remove('is-visible')
  return <><ChapterHero {...p}/><main><section className="section personal-intro"><h2>{p.heading}</h2><Narrative paragraphs={p.copy}/></section>
    <section className="section post-grid">{p.videos.map((video, index) => <PersonalVideoTile key={video.id} video={video} open={opener => { hideCursor(); setLight({ index, opener }) }} onPointerMove={moveCursor} onPointerEnter={showCursor} onPointerLeave={hideCursor} />)}</section></main>
    <div className="personal-cursor mono" ref={cursorRef} aria-hidden="true">PLAY</div>
    {light && <Lightbox type="youtube" videos={p.videos} initialIndex={light.index} opener={light.opener} close={() => setLight(null)} />}<Footer/></>
}

export default function App() {
  const [url,setUrl]=useState(location.pathname + location.hash)
  const [contactOpen, setContactOpen] = useState(false)
  const [contactOpener, setContactOpener] = useState<HTMLElement | null>(null)
  const path = url.split('#')[0]
  useEffect(()=>{ const f=()=>setUrl(location.pathname + location.hash); addEventListener('popstate',f); return()=>removeEventListener('popstate',f)},[])
  useEffect(() => {
    const openContact = (event: Event) => {
      setContactOpener((event as CustomEvent<HTMLElement>).detail)
      setContactOpen(true)
    }
    addEventListener(CONTACT_EVENT, openContact)
    return () => {
      removeEventListener(CONTACT_EVENT, openContact)
    }
  }, [])
  useEffect(() => {
    const enforceSingleVideo = (event: Event) => {
      const activeVideo = event.target
      if (!(activeVideo instanceof HTMLVideoElement)) return
      document.querySelectorAll('video').forEach(video => video !== activeVideo && video.pause())
    }
    document.addEventListener('play', enforceSingleVideo, true)
    return () => document.removeEventListener('play', enforceSingleVideo, true)
  }, [])
  useEffect(()=>{
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const id = location.hash.slice(1)
      const target = id && document.getElementById(id)
      if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      else if (!location.hash) scrollTo(0, 0)
    }))
  },[url])
  useEffect(()=>{ const bar=document.querySelector('.progress') as HTMLElement; const f=()=>bar.style.transform=`scaleX(${scrollY/(document.documentElement.scrollHeight-innerHeight)||0})`; addEventListener('scroll',f,{passive:true}); return()=>removeEventListener('scroll',f)},[path])
  const Page=path==='/novare-talent'?Novare:path==='/freelance'?Freelance:path==='/personal-brand'?Personal:Home
  return <><div className="progress"/><div className="page-wipe"/><Page/><ContactButton className="mobile-talk">LET'S TALK ↗</ContactButton>
    <ContactModal open={contactOpen} close={() => setContactOpen(false)} opener={contactOpener} />
  </>
}
