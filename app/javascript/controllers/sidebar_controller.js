import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["aside"]

  connect() {
    this.isPinned = localStorage.getItem("sidebar_pinned") === "true"
    this.applyState()
  }

  hoverEnter() {
    if (!this.isPinned) {
      this.asideTarget.classList.add("is-expanded")
    }
  }

  hoverLeave() {
    if (!this.isPinned) {
      this.asideTarget.classList.remove("is-expanded")
      
      // Also close the profile dropdown if it's open when minimizing
      const dropdown = this.asideTarget.querySelector('details[data-controller="dropdown"]')
      if (dropdown && dropdown.hasAttribute("open")) {
        dropdown.removeAttribute("open")
      }
    }
  }

  toggle() {
    this.isPinned = !this.isPinned
    localStorage.setItem("sidebar_pinned", this.isPinned)
    this.applyState()
  }

  applyState() {
    if (this.isPinned) {
      // Pinned state: Outer container expands to push content
      this.element.classList.remove("w-[84px]")
      this.element.classList.add("w-[288px]") // 256px (w-64) + 16px left + 16px right margin
      
      // Inner aside stays expanded permanently
      this.asideTarget.classList.add("is-expanded")
      this.asideTarget.classList.add("is-pinned")
    } else {
      // Unpinned state: Outer container shrinks back
      this.element.classList.add("w-[84px]")
      this.element.classList.remove("w-[288px]")
      
      this.asideTarget.classList.remove("is-pinned")
      
      // If the mouse is actually hovering right now (e.g., they just clicked the toggle button), expand it.
      // Otherwise, keep it minimized.
      if (this.element.matches(":hover")) {
        this.hoverEnter()
      } else {
        this.asideTarget.classList.remove("is-expanded")
      }
    }
  }
}
