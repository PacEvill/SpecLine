import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["drawer", "backdrop"]

  connect() {
    this.boundCloseOnEsc = this.closeOnEsc.bind(this)
    window.addEventListener("keydown", this.boundCloseOnEsc)
  }

  disconnect() {
    window.removeEventListener("keydown", this.boundCloseOnEsc)
    document.body.classList.remove("overflow-hidden")
  }

  open() {
    if (this.hasDrawerTarget && this.hasBackdropTarget) {
      this.backdropTarget.classList.remove("hidden")
      // Force layout reflow before opacity transition
      void this.backdropTarget.offsetWidth
      this.backdropTarget.classList.remove("opacity-0")
      this.backdropTarget.classList.add("opacity-100")

      this.drawerTarget.classList.remove("-translate-x-full")
      this.drawerTarget.classList.add("translate-x-0")
      document.body.classList.add("overflow-hidden")
    }
  }

  close() {
    if (this.hasDrawerTarget && this.hasBackdropTarget) {
      this.backdropTarget.classList.remove("opacity-100")
      this.backdropTarget.classList.add("opacity-0")

      this.drawerTarget.classList.remove("translate-x-0")
      this.drawerTarget.classList.add("-translate-x-full")
      document.body.classList.remove("overflow-hidden")

      setTimeout(() => {
        if (this.hasBackdropTarget && this.backdropTarget.classList.contains("opacity-0")) {
          this.backdropTarget.classList.add("hidden")
        }
      }, 300)
    }
  }

  toggle() {
    if (this.hasDrawerTarget && this.drawerTarget.classList.contains("translate-x-0")) {
      this.close()
    } else {
      this.open()
    }
  }

  closeOnEsc(event) {
    if (event.key === "Escape" || event.key === "Esc") {
      this.close()
    }
  }
}
