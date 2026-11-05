// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyFilter } from './filter'
import { countLabel, createTranslator, ENGLISH, loadLanguage, saveLanguage } from './i18n'

const html = readFileSync('index.html', 'utf8')
const body = html.slice(html.indexOf('<body>'))

function loadPage() {
  document.documentElement.lang = 'fr'
  document.title = 'Maxime Youta · Développeur web junior'
  document.head.innerHTML = '<title>Maxime Youta · Développeur web junior</title><meta name="description" content="Portfolio de Maxime Youta">'
  document.body.innerHTML = body
}

const titles = () => [...document.querySelectorAll<HTMLElement>('.project:not([hidden]) h3')].map((title) => title.textContent)

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-BE')
  loadPage()
})

describe('language', () => {
  it.each([
    ['fr-BE', 'fr'],
    ['fr', 'fr'],
    ['en-GB', 'en'],
    ['de-DE', 'en'],
    ['es', 'en'],
  ])('follows a browser set to %s on the first visit', (browser, lang) => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(browser)

    expect(loadLanguage()).toBe(lang)
  })

  it('keeps the chosen language over the language of the browser', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB')
    saveLanguage('fr')

    expect(loadLanguage()).toBe('fr')
  })

  it('ignores an unknown stored language', () => {
    localStorage.setItem('portfolio.lang', 'de')

    expect(loadLanguage()).toBe('fr')
  })

  it('switches the text, the title, the page language and the CV, then comes back to French', () => {
    const translate = createTranslator(document)
    const cv = document.querySelector('.cv')!

    translate('en')

    expect(document.querySelector('.intro h2')).toHaveProperty('textContent', ENGLISH['intro.title'])
    expect(document.title).toBe(ENGLISH['page.title'])
    expect(document.documentElement.lang).toBe('en')
    expect(cv.getAttribute('href')).toBe('cv/CV_Maxime_Youta_Developer.pdf')
    expect(document.querySelector('[data-lang="en"]')?.getAttribute('aria-pressed')).toBe('true')

    translate('fr')

    expect(document.querySelector('.intro h2')).toHaveProperty('textContent', 'Cinq applications en ligne, testées et déployées.')
    expect(document.title).toBe('Maxime Youta · Développeur web junior')
    expect(cv.getAttribute('href')).toBe('cv/CV_Maxime_Youta_Developpeur_FR.pdf')
  })

  it('has an English text for every key of the page, and no key left over', () => {
    const keys = new Set(['page.title', 'page.description'])
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => keys.add(element.dataset.i18n!))
    document.querySelectorAll<HTMLElement>('[data-i18n-label]').forEach((element) => keys.add(element.dataset.i18nLabel!))

    expect([...keys].sort()).toEqual(Object.keys(ENGLISH).sort())
  })

  it('counts projects in each language', () => {
    expect(countLabel('fr', 1)).toBe('1 projet')
    expect(countLabel('fr', 6)).toBe('6 projets')
    expect(countLabel('en', 1)).toBe('1 project')
    expect(countLabel('en', 6)).toBe('6 projects')
  })
})

describe('project filter', () => {
  it('shows every project by default', () => {
    expect(applyFilter(document, 'all')).toBe(6)
  })

  it.each([
    ['symfony', ['Figurama', 'RecetteVie']],
    ['angular', ['SuiviFormation']],
    ['react', ['Église Le Rocher', 'Semainier']],
    ['php', ['Figurama', 'RecetteVie', 'Escales']],
  ])('keeps only the %s projects', (tech, expected) => {
    expect(applyFilter(document, tech)).toBe(expected.length)
    expect(titles()).toEqual(expected)
  })

  it('marks the active filter for screen readers', () => {
    applyFilter(document, 'angular')

    expect(document.querySelector('[data-filter="angular"]')?.getAttribute('aria-pressed')).toBe('true')
    expect(document.querySelector('[data-filter="all"]')?.getAttribute('aria-pressed')).toBe('false')
  })
})

describe('project links', () => {
  it('gives every project a live link and points to existing images', () => {
    document.querySelectorAll('.project').forEach((project) => {
      expect(project.querySelector('.links a')?.getAttribute('href')).toMatch(/^https:\/\//)
      expect(readFileSync(`public/${project.querySelector('img')?.getAttribute('src')}`).length).toBeGreaterThan(0)
    })
  })
})
