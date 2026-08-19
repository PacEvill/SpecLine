import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { delay: { type: Number, default: 1000 } }

  connect() {
    this.save = this.save.bind(this)
  }

  schedule() {
    clearTimeout(this.timeout)
    const statusEl = document.getElementById("autosave-status")
    if (statusEl) statusEl.textContent = "Pendente..."
    
    this.timeout = setTimeout(this.save, this.delayValue)
  }

  async save() {
    const statusEl = document.getElementById("autosave-status")
    if (statusEl) statusEl.textContent = "Salvando..."

    const form = this.element
    const formData = new FormData(form)
    
    // O Rails usa `_method=patch` via form hidden field. Precisamos enviar como POST.
    try {
      const response = await fetch(form.action, {
        method: 'POST', // FormData will contain _method=patch
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        if (statusEl) {
          statusEl.textContent = "Salvo"
        }
      } else {
        if (statusEl) statusEl.textContent = "Falha ao salvar"
      }
    } catch(e) {
      if (statusEl) statusEl.textContent = "Erro de conexão"
    }
  }
}
