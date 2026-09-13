import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "release", "filterBtn", "copyFeedback", "subscribeInput", "subscribeSuccess", "subscribeForm" ]

  connect() {
    this.currentFilter = "all"
  }

  filter(event) {
    const selectedVersion = event.currentTarget.dataset.version
    if (!selectedVersion) return
    this.currentFilter = selectedVersion

    // Update filter button styles
    this.filterBtnTargets.forEach(btn => {
      const isSelected = btn.dataset.version === selectedVersion
      if (isSelected) {
        btn.className = "px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider bg-ink text-white dark:bg-white dark:text-ink shadow-sm transition-all duration-200 cursor-pointer"
      } else {
        btn.className = "px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider bg-white/60 dark:bg-white/5 text-ink/70 dark:text-white/70 border border-ink/10 dark:border-white/10 hover:border-ink/30 dark:hover:border-white/30 transition-all duration-200 cursor-pointer"
      }
    })

    // Show/hide releases
    this.releaseTargets.forEach(card => {
      const version = card.dataset.version
      if (selectedVersion === "all" || version === selectedVersion) {
        card.classList.remove("hidden")
        card.classList.remove("animate-fade-in")
        void card.offsetWidth
        card.classList.add("animate-fade-in")
      } else {
        card.classList.add("hidden")
      }
    })
  }

  copyHash(event) {
    const hash = event.currentTarget.dataset.hash
    if (!hash) return
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hash).then(() => {
        const feedback = event.currentTarget.querySelector("[data-changelog-target='copyFeedback']")
        if (feedback) {
          const original = feedback.textContent
          feedback.textContent = "Copiado!"
          setTimeout(() => {
            feedback.textContent = original
          }, 1800)
        }
      })
    }
  }

  subscribe(event) {
    event.preventDefault()
    if (this.hasSubscribeInputTarget && this.subscribeInputTarget.value.trim() !== "") {
      if (this.hasSubscribeFormTarget && this.hasSubscribeSuccessTarget) {
        this.subscribeFormTarget.classList.add("hidden")
        this.subscribeSuccessTarget.classList.remove("hidden")
      }
    }
  }
}
