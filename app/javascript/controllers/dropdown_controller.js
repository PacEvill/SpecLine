import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.closeMenuOutside = this.closeMenuOutside.bind(this)
    document.addEventListener("click", this.closeMenuOutside)
  }

  disconnect() {
    document.removeEventListener("click", this.closeMenuOutside)
  }

  closeOnEsc(event) {
    if (event.key === "Escape" && this.element.hasAttribute("open")) {
      this.element.removeAttribute("open")
    }
  }

  toggle(event) {
    if (this.element.hasAttribute("open")) {
      event.preventDefault();
      this.element.removeAttribute("open");
    }
  }

  closeMenuOutside(event) {
    if (!this.element.contains(event.target)) {
      this.element.removeAttribute("open")
    }
  }

  close() {
    this.element.removeAttribute("open")
  }
}
