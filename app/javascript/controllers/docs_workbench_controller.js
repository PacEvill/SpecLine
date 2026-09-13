import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["sidebar", "canvas", "btnNormal", "btnZen", "typewriter", "zenStatus", "tabBtn", "tabContent"]

  connect() {
    this.isZen = false
  }

  setMode(event) {
    const mode = event.currentTarget.dataset.mode
    this.isZen = mode === "zen"

    if (this.isZen) {
      if (this.hasBtnZenTarget) {
        this.btnZenTarget.className = "px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-ink text-white dark:bg-white dark:text-ink font-semibold transition-all shadow-sm cursor-pointer"
      }
      if (this.hasBtnNormalTarget) {
        this.btnNormalTarget.className = "px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-all cursor-pointer"
      }
      if (this.hasSidebarTarget) {
        this.sidebarTarget.classList.add('hidden')
      }
      if (this.hasCanvasTarget) {
        this.canvasTarget.className = "col-span-12 max-w-2xl mx-auto p-8 md:p-16 bg-white dark:bg-ink-paper transition-all duration-500 min-h-[580px] flex flex-col justify-between"
      }
      if (this.hasTypewriterTargets) {
        this.typewriterTargets.forEach(el => el.classList.add('opacity-40', 'hover:opacity-100', 'transition-opacity'))
      }
      if (this.hasZenStatusTarget) {
        this.zenStatusTarget.classList.remove('hidden')
      }
    } else {
      if (this.hasBtnNormalTarget) {
        this.btnNormalTarget.className = "px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider bg-ink text-white dark:bg-white dark:text-ink font-semibold transition-all shadow-sm cursor-pointer"
      }
      if (this.hasBtnZenTarget) {
        this.btnZenTarget.className = "px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
      }
      if (this.hasSidebarTarget) {
        this.sidebarTarget.classList.remove('hidden')
      }
      if (this.hasCanvasTarget) {
        this.canvasTarget.className = "col-span-12 md:col-span-8 lg:col-span-9 p-6 md:p-12 bg-white dark:bg-ink-paper overflow-y-auto max-h-[640px] transition-all duration-500"
      }
      if (this.hasTypewriterTargets) {
        this.typewriterTargets.forEach(el => el.classList.remove('opacity-40', 'hover:opacity-100', 'transition-opacity'))
      }
      if (this.hasZenStatusTarget) {
        this.zenStatusTarget.classList.add('hidden')
      }
    }
  }

  selectTab(event) {
    const targetTabId = event.currentTarget.dataset.tab

    this.tabBtnTargets.forEach(btn => {
      if (btn.dataset.tab === targetTabId) {
        btn.className = "px-3 py-1 text-[10px] font-mono uppercase tracking-wider bg-ink text-white dark:bg-white dark:text-ink font-bold rounded shadow-sm transition-all cursor-pointer"
      } else {
        btn.className = "px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-ink/60 dark:text-white/60 hover:text-ink dark:hover:text-white transition-all cursor-pointer"
      }
    })

    this.tabContentTargets.forEach(content => {
      if (content.id === targetTabId) {
        content.classList.remove('hidden')
        content.classList.add('animate-pop-in')
      } else {
        content.classList.add('hidden')
        content.classList.remove('animate-pop-in')
      }
    })
  }
}
