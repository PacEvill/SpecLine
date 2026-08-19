import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["light", "dark", "system"]

  connect() {
    this.updateSelection()
  }

  setLight(event) {
    if (event) event.preventDefault()
    localStorage.theme = 'light'
    document.documentElement.classList.remove('dark')
    this.updateSelection()
  }

  setDark(event) {
    if (event) event.preventDefault()
    localStorage.theme = 'dark'
    document.documentElement.classList.add('dark')
    this.updateSelection()
  }

  setSystem(event) {
    if (event) event.preventDefault()
    localStorage.removeItem('theme')
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    this.updateSelection()
  }

  updateSelection() {
    // Determine current theme setting
    const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    // Check radio buttons if they exist
    if (this.hasLightTarget) this.lightTarget.checked = localStorage.theme === 'light'
    if (this.hasDarkTarget) this.darkTarget.checked = localStorage.theme === 'dark'
    if (this.hasSystemTarget) this.systemTarget.checked = !('theme' in localStorage)
  }
}
