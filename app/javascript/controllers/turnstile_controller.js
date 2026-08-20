import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="turnstile"
export default class extends Controller {
  static values = { sitekey: String }

  connect() {
    this.renderWhenReady()
  }

  renderWhenReady() {
    if (window.turnstile) {
      this.renderWidget()
    } else {
      let attempts = 0
      const maxAttempts = 100 // 5 seconds
      const interval = setInterval(() => {
        attempts++
        if (window.turnstile) {
          clearInterval(interval)
          this.renderWidget()
        } else if (attempts >= maxAttempts) {
          clearInterval(interval)
          console.error("[Turnstile] Cloudflare Turnstile script failed to load.")
        }
      }, 50)
    }
  }

  renderWidget() {
    if (!this.sitekeyValue) {
      console.warn("[Turnstile] Site key is missing.")
      return
    }

    // Clean up if already rendered in this container
    this.element.innerHTML = ""

    try {
      this.widgetId = window.turnstile.render(this.element, {
        sitekey: this.sitekeyValue,
        theme: document.documentElement.classList.contains("dark") ? "dark" : "light"
      })
    } catch (e) {
      console.error("[Turnstile] Error rendering widget:", e)
    }
  }

  disconnect() {
    if (this.widgetId && window.turnstile) {
      try {
        window.turnstile.remove(this.widgetId)
        this.widgetId = null
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
}
