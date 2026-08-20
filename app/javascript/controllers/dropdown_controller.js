import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu"]

  connect() {
    this.closeOutside = this.closeOutside.bind(this)
    document.addEventListener("click", this.closeOutside)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close()
    })
  }

  disconnect() {
    document.removeEventListener("click", this.closeOutside)
  }

  toggle(event) {
    if (event) event.stopPropagation()

    if (this.hasMenuTarget) {
      this.menuTarget.classList.toggle("hidden")
    } else if (this.element.tagName === "DETAILS") {
      if (this.element.hasAttribute("open")) {
        this.element.removeAttribute("open")
      } else {
        this.element.setAttribute("open", "")
      }
    }
  }

  close() {
    if (this.hasMenuTarget) {
      this.menuTarget.classList.add("hidden")
    } else if (this.element.tagName === "DETAILS") {
      this.element.removeAttribute("open")
    }
  }

  closeOutside(event) {
    if (!this.element.contains(event.target)) {
      this.close()
    }
  }
}
