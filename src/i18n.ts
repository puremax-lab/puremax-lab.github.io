export type Lang = 'fr' | 'en'

const KEY = 'portfolio.lang'

/** The English text of each `data-i18n` key. The French text lives in index.html. */
export const ENGLISH: Record<string, string> = {
  'page.title': 'Maxime Youta · Junior web developer',
  'page.description': 'Portfolio of Maxime Youta, junior web developer in Brussels: five live applications and a client site, built with Symfony, Angular and React.',
  'side.role': 'Junior web developer',
  'side.meta': 'Brussels · available',
  'side.nav': 'Sections',
  'side.projects': 'live projects',
  'side.tests': 'automated tests',
  'side.cv': 'Download my CV',
  'side.lang': 'Language',
  'nav.projects': 'Projects',
  'nav.path': 'Background',
  'nav.contact': 'Contact',
  'intro.title': 'Five applications and a client site live, tested and deployed.',
  'intro.text': 'Trained at CFITECH, I build complete applications with Symfony on the server and Angular or React on the front end, all the way to production. My years in customer relations taught me to listen to users and to explain technical work simply.',
  'projects.title': 'Projects',
  'projects.filter': 'Filter by technology',
  'filter.all': 'All',
  'p.site': 'See the site',
  'p.private': 'Private code',
  'p.demo': 'Demo',
  'p.code': 'Code',
  'p.eglise.kind': 'Client website, built by two developers',
  'p.eglise.text': 'The official website of a church in Brussels, in production. My 156 commits: responsive pages and carousels, admin screens, automatic image compression, Excel export and production fixes.',
  'p.figurama.kind': 'Online shop · 60 tests',
  'p.figurama.text': 'Cart, Stripe payment with a signed webhook, and a back office. Stock is reserved inside a transaction, so two customers cannot buy the last piece.',
  'p.recettevie.kind': 'Recipe website · 62 tests',
  'p.recettevie.text': 'Accounts, roles, photo upload and automatic translation with DeepL. Its REST API, secured with JWT, powers a second application.',
  'p.semainier.kind': 'Meal planner · 34 tests',
  'p.semainier.text': "Plan the week's meals and get the shopping list automatically, through the RecetteVie API and with the same accounts.",
  'p.suivi.kind': 'Attendance tracker · 57 tests',
  'p.suivi.text': 'Two roles, a dashboard and one-click attendance. Every push tests, builds and deploys the app to GitHub Pages.',
  'p.escales.kind': 'Travel journal · 90 tests',
  'p.escales.text': 'Written in plain PHP, with no framework and no JavaScript, to understand what a framework does for me: hand-built router, MVC structure and security layer.',
  'path.title': 'Background',
  'path.vyreon.title': 'Web developer and Business Developer',
  'path.vyreon.text': 'Vyreon, self-employed, Brussels. Websites for clients and sales follow-up through to contract signature.',
  'path.cfitech.title': 'Web Developer Certificate',
  'path.cfitech.text': 'CFITECH with Bruxelles Formation: 1,332 hours, from HTML to Symfony, Angular and React, with a final project and an internship at BetterflyBox.',
  'path.client.title': 'Customer advisor and technical support',
  'path.client.text': 'Orange and IPG for Luminus: customer advice, technical support, billing, Salesforce and SAP.',
  'path.kfc.title': 'Shift leader, assistant manager',
  'path.kfc.text': 'KFC, Liège: team leadership and training, schedules and cash handling.',
  'skills.back': 'Back end',
  'skills.front': 'Front end',
  'skills.quality': 'Quality and delivery',
  'skills.languages': 'Languages',
  'skills.languages.list': 'French and English C2, Dutch B1, German A2',
  'contact.title': "Let's work together",
  'contact.text': 'I am looking for a first position as a full-stack, PHP/Symfony or front-end (Angular, React) developer in Brussels.',
  'contact.note': 'Personal website of Maxime Youta. No cookies, no visitor analytics.',
}

const COUNT = {
  fr: (shown: number) => `${shown} ${shown > 1 ? 'projets' : 'projet'}`,
  en: (shown: number) => `${shown} ${shown === 1 ? 'project' : 'projects'}`,
}

export function countLabel(lang: Lang, shown: number): string {
  return COUNT[lang](shown)
}

function storedLanguage(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** The visitor's choice, or else the browser's language: French stays French, anything else gives English. */
export function loadLanguage(): Lang {
  const stored = storedLanguage()
  if (stored === 'fr' || stored === 'en') return stored
  return /^(?!fr\b)[a-z]/i.test(navigator.language) ? 'en' : 'fr'
}

export function saveLanguage(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    // Private browsing: the choice lasts until the next reload.
  }
}

function setMeta(root: Document, lang: Lang, french: Map<string, string>): void {
  root.title = lang === 'en' ? ENGLISH['page.title'] : french.get('page.title')!
  const description = lang === 'en' ? ENGLISH['page.description'] : french.get('page.description')!
  root.querySelector('meta[name="description"]')?.setAttribute('content', description)
}

/** Reads the French text once, so that switching back never needs a second dictionary. */
export function createTranslator(root: Document) {
  const french = new Map<string, string>([
    ['page.title', root.title],
    ['page.description', root.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''],
  ])
  const texts = [...root.querySelectorAll<HTMLElement>('[data-i18n]')]
  const labels = [...root.querySelectorAll<HTMLElement>('[data-i18n-label]')]
  const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-en-href]')]
  texts.forEach((element) => french.set(element.dataset.i18n!, element.textContent ?? ''))
  labels.forEach((element) => french.set(element.dataset.i18nLabel!, element.getAttribute('aria-label') ?? ''))
  const frenchHref = new Map(links.map((link) => [link, link.getAttribute('href') ?? '']))

  return (lang: Lang) => {
    const pick = (key: string) => (lang === 'en' ? ENGLISH[key] : french.get(key)) ?? ''
    root.documentElement.lang = lang
    setMeta(root, lang, french)
    texts.forEach((element) => {
      element.textContent = pick(element.dataset.i18n!)
    })
    labels.forEach((element) => element.setAttribute('aria-label', pick(element.dataset.i18nLabel!)))
    links.forEach((link) => link.setAttribute('href', lang === 'en' ? link.dataset.enHref! : frenchHref.get(link)!))
    root.querySelectorAll<HTMLElement>('[data-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang))
    })
  }
}
