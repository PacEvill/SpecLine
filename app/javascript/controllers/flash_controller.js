import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="flash"
export default class extends Controller {
  static targets = ["message"]

  connect() {
    // Auto dismiss after 4 seconds
    this.timeout = setTimeout(() => {
      this.dismiss()
    }, 4500)
  }

  disconnect() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  dismiss() {
    this.element.classList.add("opacity-0", "translate-y-[-10px]")
    setTimeout(() => {
      this.element.remove()
    }, 400)
  }
}
