import '@fontsource-variable/dm-sans'
import '@fontsource/ibm-plex-mono/400.css'
import './style.css'
import { applyFilter } from './filter'
import { countLabel, createTranslator, loadLanguage, saveLanguage, type Lang } from './i18n'

const translate = createTranslator(document)
const count = document.querySelector<HTMLElement>('[data-count]')!
let lang: Lang = loadLanguage()
let tech = 'all'

function refreshCount(): void {
  count.textContent = countLabel(lang, applyFilter(document, tech))
}

function setLanguage(next: Lang): void {
  lang = next
  translate(lang)
  refreshCount()
}

document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((button) => {
  button.addEventListener('click', () => {
    const next = button.dataset.lang as Lang
    saveLanguage(next)
    setLanguage(next)
  })
})

document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    tech = button.dataset.filter!
    refreshCount()
  })
})

// Underlines the section being read in the side menu.
const links = [...document.querySelectorAll<HTMLAnchorElement>('.nav a')]
const observer = new IntersectionObserver(
  (entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .forEach((entry) => {
        links.forEach((link) => link.classList.toggle('current', link.hash === `#${entry.target.id}`))
      })
  },
  { rootMargin: '-30% 0px -60% 0px' },
)
document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section))

setLanguage(lang)
document.documentElement.classList.remove('pending')
