import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="modal"
export default class extends Controller {
  close(event) {
    if (event) {
      event.preventDefault()
    }
    
    const frame = this.element.closest("turbo-frame")
    this.element.remove()
    
    // Clean up turbo-frame content so it can be requested again
    if (frame) {
      frame.removeAttribute("src")
      frame.innerHTML = ""
    }
  }

  closeBackground(event) {
    if (event.target === this.element) {
      this.close()
    }
  }

  connect() {
    this.handleKeydown = this.handleKeydown.bind(this)
    document.addEventListener("keydown", this.handleKeydown)
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeydown)
  }

  handleKeydown(event) {
    if (event.key === "Escape") {
      this.close()
    }
  }
}
