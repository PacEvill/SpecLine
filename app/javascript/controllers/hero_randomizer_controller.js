import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["comp"]

  connect() {
    if (!this.compTargets || this.compTargets.length === 0) return

    const total = this.compTargets.length

    // Hide all cards first
    this.compTargets.forEach(card => {
      card.classList.add('hidden')
      card.classList.remove('block')
    })

    // Get the index from previous reload
    const stored = sessionStorage.getItem('specline_hero_idx')
    const lastIndex = stored !== null ? parseInt(stored, 10) : -1

    // Always select a DIFFERENT card from the last one on every reload
    let nextIndex = Math.floor(Math.random() * total)
    if (total > 1 && nextIndex === lastIndex) {
      nextIndex = (lastIndex + 1) % total
    }

    sessionStorage.setItem('specline_hero_idx', nextIndex.toString())

    // Reveal the selected card
    const targetCard = this.compTargets[nextIndex]
    if (targetCard) {
      targetCard.classList.remove('hidden')
      targetCard.classList.add('block')
    }
  }
}
