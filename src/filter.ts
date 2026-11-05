/** Shows the projects that use a technology ("all" shows everything) and returns how many remain. */
export function applyFilter(root: Document, tech: string): number {
  let shown = 0
  root.querySelectorAll<HTMLElement>('.project').forEach((project) => {
    const match = tech === 'all' || (project.dataset.tech ?? '').split(' ').includes(tech)
    project.hidden = !match
    if (match) shown += 1
  })
  root.querySelectorAll<HTMLElement>('[data-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === tech))
  })
  return shown
}
