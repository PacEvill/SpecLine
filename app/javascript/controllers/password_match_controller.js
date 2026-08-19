import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["password", "confirmation", "message"]

  check() {
    const pwd = this.passwordTarget.value
    const conf = this.confirmationTarget.value

    if (conf.length === 0) {
      this.messageTarget.textContent = ""
      this.messageTarget.className = "text-xs font-medium transition-colors hidden mt-1 block"
      return
    }

    this.messageTarget.classList.remove("hidden")

    if (pwd === conf) {
      this.messageTarget.innerHTML = `<span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Senhas iguais</span>`
      this.messageTarget.className = "text-xs font-medium text-green-600 transition-colors mt-1 block"
    } else {
      this.messageTarget.innerHTML = `<span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> As senhas não coincidem</span>`
      this.messageTarget.className = "text-xs font-medium text-red-500 transition-colors mt-1 block"
    }
  }
}
