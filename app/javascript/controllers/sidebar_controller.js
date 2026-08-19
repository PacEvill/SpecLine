import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container"]

  connect() {
    // Check local storage for preference
    const isExpanded = localStorage.getItem("sidebar_expanded") === "true"
    if (isExpanded) {
      this.element.classList.add("is-expanded")
      this.element.classList.add("w-64")
      this.element.classList.remove("w-16")
    } else {
      this.element.classList.remove("is-expanded")
      this.element.classList.remove("w-64")
      this.element.classList.add("w-16")
    }
  }

  toggle() {
    this.element.classList.toggle("is-expanded")
    
    if (this.element.classList.contains("is-expanded")) {
      this.element.classList.add("w-64")
      this.element.classList.remove("w-16")
      localStorage.setItem("sidebar_expanded", "true")
    } else {
      this.element.classList.remove("w-64")
      this.element.classList.add("w-16")
      localStorage.setItem("sidebar_expanded", "false")
      
      // Also close the profile dropdown if it's open when minimizing
      const dropdown = this.element.querySelector('details[data-controller="dropdown"]')
      if (dropdown && dropdown.hasAttribute("open")) {
        dropdown.removeAttribute("open")
      }
    }
  }
}
